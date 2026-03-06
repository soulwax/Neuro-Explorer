import { Liquid } from 'liquidjs';
import { layout } from './templates/layout.js';
import { home, homeData } from './templates/home.js';
import { neuron, neuronParams } from './templates/neuron.js';
import { vision, visionStages } from './templates/vision.js';
import { ask, askData } from './templates/ask.js';
import { plasticity, plasticityParams } from './templates/plasticity.js';
import { ecg, ecgLeads, ecgParams } from './templates/ecg.js';

const engine = new Liquid({ cache: true });

function render(active: string, title: string, bodyTemplate: string, data: Record<string, unknown> = {}, status = 200): Response {
	const body = engine.parseAndRenderSync(bodyTemplate, data);
	const html = engine.parseAndRenderSync(layout, { title, active, body });
	return new Response(html, {
		status,
		headers: { 'Content-Type': 'text/html;charset=UTF-8' },
	});
}

export function handleUI(_request: Request, path: string): Response {
	switch (path) {
		case '/':
			return render('home', 'Home', home, homeData);
		case '/ui/neuron':
			return render('neuron', 'Neuron Simulation', neuron, { params: neuronParams });
		case '/ui/vision':
			return render('vision', 'Visual Cortex', vision, { stages: visionStages });
		case '/ui/ask':
			return render('ask', 'Neuro Tutor', ask, askData);
		case '/ui/plasticity':
			return render('plasticity', 'Synaptic Plasticity', plasticity, { params: plasticityParams });
		case '/ui/ecg':
			return render('ecg', '12-Lead ECG Explorer', ecg, { params: ecgParams, leads: ecgLeads });
		default:
			return render(
				'home',
				'Not Found',
				'<h1>404</h1><p class="subtitle">Page not found</p><p><a href="/" style="color:var(--primary)">Back to home</a></p>',
				{},
				404
			);
	}
}
