import type { AiClient } from '../ai/client.js';

/**
 * Vision Route — Image Classification with Visual Cortex Analogy
 *
 * Uses ResNet-50 to classify images, then maps the network architecture
 * to the ventral visual stream in the human brain:
 *
 *   Retina -> V1 -> V2 -> V4 -> IT cortex -> Prefrontal (decision)
 *   Input  -> Conv1 -> Block1 -> Block2 -> Block3 -> Block4 -> FC
 *
 * Each "block" of ResNet learns features of increasing complexity,
 * mirroring how visual cortex areas process increasingly abstract features.
 */

// Mapping ResNet-50 stages to visual cortex areas
const CORTICAL_MAP = [
	{
		resnetStage: 'Conv1 + MaxPool (7x7 conv, stride 2)',
		corticalArea: 'V1 (Primary Visual Cortex)',
		features: 'Oriented edges, contrast boundaries, simple gratings',
		biology:
			'V1 neurons are famously tuned to oriented bars (Hubel & Wiesel, 1962 Nobel Prize). Simple cells detect edges at specific orientations; complex cells are position-invariant.',
	},
	{
		resnetStage: 'Block 1 (3 bottleneck layers)',
		corticalArea: 'V2 (Secondary Visual Cortex)',
		features: 'Corners, junctions, texture boundaries, illusory contours',
		biology:
			'V2 neurons respond to border ownership and can detect contours even when parts are occluded. They begin grouping V1 outputs into more meaningful patterns.',
	},
	{
		resnetStage: 'Block 2 (4 bottleneck layers)',
		corticalArea: 'V4 (Visual Area 4)',
		features: 'Curvature, color constancy, moderate shape complexity',
		biology:
			'V4 is critical for color perception and shape processing. Damage to V4 causes achromatopsia (loss of color vision). Neurons here respond to partial shapes and contour fragments.',
	},
	{
		resnetStage: 'Block 3 (6 bottleneck layers)',
		corticalArea: 'IT (Inferotemporal Cortex) — posterior',
		features: 'Object parts, textures, category-level features',
		biology:
			'Posterior IT neurons respond to complex object features — face parts, body parts, object components. This is where "grandmother cells" vs distributed coding debate lives.',
	},
	{
		resnetStage: 'Block 4 (3 bottleneck layers)',
		corticalArea: 'IT (Inferotemporal Cortex) — anterior',
		features: 'Whole objects, view-invariant representations',
		biology:
			'Anterior IT neurons are selective for specific objects regardless of position, size, or viewpoint. The "face area" (fusiform face area) is located here.',
	},
	{
		resnetStage: 'Global Average Pool + Fully Connected',
		corticalArea: 'Prefrontal Cortex (decision/categorization)',
		features: 'Category labels, semantic decisions',
		biology:
			'Prefrontal cortex integrates IT representations for task-relevant decisions. "Is this a dog or a cat?" requires PFC to map IT object representations to learned categories.',
	},
];

const SKIP_CONNECTION_EXPLANATION = {
	what: "ResNet's key innovation: skip (residual) connections that bypass layers, letting gradients flow directly backward.",
	neuroscience:
		'The brain has extensive feedback and skip connections too. V1 receives feedback from V2, V4, and even IT cortex. These top-down connections carry predictions and attention signals, not just bottom-up features. This is central to predictive coding theory: the brain constantly predicts its own inputs and only propagates prediction errors upward.',
};

export async function handleVision(request: Request, ai: AiClient): Promise<Response> {
	const url = new URL(request.url);
	const imageUrl = url.searchParams.get('url');

	// If no image URL, return the cortical mapping as educational content
	if (!imageUrl) {
		return new Response(
			JSON.stringify(
				{
					usage: 'GET /vision?url=<image_url> to classify an image',
					ventral_stream: CORTICAL_MAP,
					skip_connections: SKIP_CONNECTION_EXPLANATION,
					key_insight:
						'ResNet-50 has 50 layers organized in 4 blocks of increasing abstraction — almost exactly mirroring the ventral visual stream from V1 to IT cortex. This is not a coincidence: both systems solve the same problem (object recognition) under similar constraints (hierarchical composition of features).',
				},
				null,
				2,
			),
			{ headers: { 'Content-Type': 'application/json' } },
		);
	}

	// Validate URL scheme — only allow http/https
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(imageUrl);
	} catch {
		return new Response(
			JSON.stringify({
				error: 'Invalid URL',
				details: { url: imageUrl },
				suggestion: 'The provided URL is not valid. Please provide a well-formed URL.',
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
		return new Response(
			JSON.stringify({
				error: 'Unsupported URL scheme',
				details: { scheme: parsedUrl.protocol, url: imageUrl },
				suggestion: `Only http:// and https:// URLs are supported. "${parsedUrl.protocol}" URLs cannot be fetched by the server.`,
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	// Fetch image with timeout using AbortController
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

	try {
		const imageResponse = await fetch(imageUrl, {
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (!imageResponse.ok) {
			return new Response(
				JSON.stringify({
					error: `Failed to fetch image`,
					details: {
						status: imageResponse.status,
						statusText: imageResponse.statusText,
						url: imageUrl,
					},
					suggestion:
						imageResponse.status === 403
							? 'The URL might be blocked. Try a different image URL that allows public access.'
							: imageResponse.status === 404
								? 'The image URL was not found. Please check the URL.'
								: 'The image could not be fetched. This may be due to CORS restrictions, network issues, or the server blocking requests.',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Check content type to ensure it's an image
		const contentType = imageResponse.headers.get('content-type') || '';
		if (!contentType.startsWith('image/')) {
			return new Response(
				JSON.stringify({
					error: 'Invalid content type',
					details: { contentType, url: imageUrl },
					suggestion: 'The URL must point to a valid image file (JPEG, PNG, GIF, WebP, etc.)',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());

		// Check minimum size (empty or too small)
		if (imageBytes.length < 100) {
			return new Response(
				JSON.stringify({
					error: 'Image too small or corrupted',
					details: { size: imageBytes.length, url: imageUrl },
					suggestion: 'The image file appears to be too small or corrupted. Please try a different image.',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const results = await ai.run('@cf/microsoft/resnet-50', {
			image: [...imageBytes],
		});

		return new Response(
			JSON.stringify(
				{
					classifications: results,
					processing_pipeline: CORTICAL_MAP,
					skip_connections: SKIP_CONNECTION_EXPLANATION,
					interpretation:
						'The labels above are the output of the final "prefrontal" layer. To reach this decision, the image was processed through all 50 layers — from raw pixel edges (V1) to full object representations (IT) to categorical decisions (PFC). Your brain does essentially the same thing in ~150ms.',
				},
				null,
				2,
			),
			{ headers: { 'Content-Type': 'application/json' } },
		);
	} catch (err: any) {
		// Check if the error is due to abort (timeout)
		const isAbortError = err.name === 'AbortError' || err.message === 'The operation was aborted.';

		return new Response(
			JSON.stringify({
				error: isAbortError ? 'Request timed out' : 'Request failed',
				details: {
					message: err.message,
					isAbort: isAbortError,
					url: imageUrl,
				},
				suggestion: isAbortError
					? 'The request timed out. The image server might be slow or unreachable. Try a different image URL.'
					: 'An error occurred while processing the image. Please check the URL and try again.',
			}),
			{
				status: isAbortError ? 408 : 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
}
