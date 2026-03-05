import { Liquid } from 'liquidjs';
import { layout } from './templates/layout';
import { home, homeData } from './templates/home';
import { neuron, neuronParams } from './templates/neuron';
import { vision, visionStages } from './templates/vision';
import { ask, askData } from './templates/ask';
import { plasticity, plasticityParams } from './templates/plasticity';

const engine = new Liquid();

function render(active: string, title: string, bodyTemplate: string, data: Record<string, unknown> = {}): Response {
	const body = engine.parseAndRenderSync(bodyTemplate, data);
	const html = engine.parseAndRenderSync(layout, { title, active, body });
	return new Response(html, {
		headers: { 'Content-Type': 'text/html;charset=UTF-8' },
	});
}

export function handleUI(request: Request): Response {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/+$/, '') || '/ui';
	const page = path.replace('/ui', '') || '/';

	switch (page) {
		case '/':
			return render('home', 'Home', home, homeData);
		case '/neuron':
			return render('neuron', 'Neuron Simulation', neuron, { params: neuronParams });
		case '/vision':
			return render('vision', 'Visual Cortex', vision, { stages: visionStages });
		case '/ask':
			return render('ask', 'Neuro Tutor', ask, askData);
		case '/plasticity':
			return render('plasticity', 'Synaptic Plasticity', plasticity, { params: plasticityParams });
		default:
			return render('home', 'Not Found', '<h1>404</h1><p class="subtitle">Page not found</p><p><a href="/ui" style="color:var(--primary)">Back to home</a></p>', {});
	}
}
