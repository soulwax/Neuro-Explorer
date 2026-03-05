/**
 * Leaky Integrate-and-Fire (LIF) Neuron Simulation
 *
 * Models the subthreshold membrane dynamics of a biological neuron:
 *   tau_m * dV/dt = -(V - V_rest) + R_m * I_ext
 *
 * When V >= V_threshold -> spike, reset to V_reset, enter refractory period.
 *
 * This is the simplest biophysically-motivated spiking neuron model,
 * capturing the essentials: passive leak, integration of input, threshold firing.
 */

interface LIFParams {
	/** Membrane time constant (ms). Larger = slower integration. Typical: 10-30ms. */
	tau: number;
	/** Resting membrane potential (mV). Biological default: -70mV. */
	restingPotential: number;
	/** Spike threshold (mV). Biological default: -55mV. */
	threshold: number;
	/** Reset potential after spike (mV). Often slightly below rest due to K+ channels. */
	resetPotential: number;
	/** External input current (nA). Drives the neuron toward threshold. */
	inputCurrent: number;
	/** Simulation duration (ms). */
	duration: number;
	/** Refractory period (ms). Neuron cannot fire during this window. */
	refractoryPeriod: number;
	/** Simulation timestep (ms). */
	dt: number;
}

interface SimulationResult {
	params: LIFParams;
	timeSeries: { t: number; voltage: number }[];
	spikeTimes: number[];
	firingRate: number;
	explanation: {
		model: string;
		biologicalAnalogies: Record<string, string>;
		whatToNotice: string[];
	};
}

const DEFAULTS: LIFParams = {
	tau: 20,
	restingPotential: -70,
	threshold: -55,
	resetPotential: -75,
	inputCurrent: 2.0,
	duration: 100,
	refractoryPeriod: 2,
	dt: 0.1,
};

function simulate(params: LIFParams): SimulationResult {
	const { tau, restingPotential, threshold, resetPotential, inputCurrent, duration, refractoryPeriod, dt } = params;

	const steps = Math.floor(duration / dt);
	const timeSeries: { t: number; voltage: number }[] = [];
	const spikeTimes: number[] = [];

	let V = restingPotential;
	let refractoryTimer = 0;

	// Membrane resistance chosen so that R_m * I gives mV-scale deflection
	const Rm = 10; // MOhm

	for (let i = 0; i <= steps; i++) {
		const t = parseFloat((i * dt).toFixed(2));

		if (refractoryTimer > 0) {
			// During refractory period: voltage clamped at reset
			refractoryTimer -= dt;
			V = resetPotential;
		} else {
			// LIF equation: tau * dV/dt = -(V - Vrest) + Rm * I
			const dV = (-(V - restingPotential) + Rm * inputCurrent) * (dt / tau);
			V += dV;
		}

		// Check threshold crossing
		if (V >= threshold && refractoryTimer <= 0) {
			spikeTimes.push(t);
			// Record the spike peak (stylized action potential peak)
			timeSeries.push({ t, voltage: 40 });
			V = resetPotential;
			refractoryTimer = refractoryPeriod;
			continue;
		}

		// Downsample output: record every 10th step or at spikes
		if (i % 10 === 0) {
			timeSeries.push({ t, voltage: parseFloat(V.toFixed(3)) });
		}
	}

	const firingRate = spikeTimes.length / (duration / 1000); // Hz

	return {
		params,
		timeSeries,
		spikeTimes,
		firingRate,
		explanation: {
			model: 'Leaky Integrate-and-Fire (LIF)',
			biologicalAnalogies: {
				tau: 'Membrane time constant - how fast the lipid bilayer capacitor charges/discharges. Set by membrane resistance and capacitance (tau = R_m * C_m).',
				restingPotential:
					'Set by the Na+/K+ ATPase pump and leak channels. The Goldman equation gives ~-70mV for a typical neuron.',
				threshold:
					'The voltage at which voltage-gated Na+ channels open en masse, triggering the all-or-nothing action potential.',
				resetPotential:
					'After a spike, K+ channels open and hyperpolarize the membrane slightly below rest (afterhyperpolarization).',
				refractoryPeriod:
					'Na+ channels are inactivated for ~1-2ms (absolute refractory) then slowly recover (relative refractory). This limits max firing rate.',
				inputCurrent:
					'Represents synaptic input from other neurons. Excitatory postsynaptic currents (EPSCs) from glutamatergic synapses.',
			},
			whatToNotice: [
				`With current=${inputCurrent}nA, the neuron fires at ${firingRate.toFixed(1)}Hz. Try increasing inputCurrent to see rate coding.`,
				'The voltage ramps up between spikes (integration), then resets (fire). This is the "integrate-and-fire" behavior.',
				'During the refractory period, no amount of input can trigger a spike - just like real Na+ channel inactivation.',
				'Try setting inputCurrent below ~1.0nA - the neuron will NOT fire. This is the rheobase: minimum current for sustained firing.',
			],
		},
	};
}

function parseParams(url: URL): LIFParams {
	const params = { ...DEFAULTS };
	for (const key of Object.keys(DEFAULTS) as (keyof LIFParams)[]) {
		const val = url.searchParams.get(key);
		if (val !== null) {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) {
				params[key] = parsed;
			}
		}
	}
	// Clamp duration to prevent abuse
	params.duration = Math.min(params.duration, 1000);
	params.dt = Math.max(params.dt, 0.05);
	return params;
}

export function handleNeuron(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulate(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
