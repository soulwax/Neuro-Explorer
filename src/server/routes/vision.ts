import type { AiClient } from '../ai/client';
import {
	visionDefaultImageUrl,
	visionKeyInsight,
	visionSkipConnections,
	visionStages,
	type VisionClassification,
} from '../../core/vision';
import { corsPreflightResponse, jsonResponse } from '../http';

export async function handleVision(request: Request, ai: AiClient): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return corsPreflightResponse();
	}

	if (request.method !== 'GET') {
		return jsonResponse(
			{
				error: 'Method not allowed',
				suggestion: 'Use GET /api/vision?url=<image_url> to classify a public image URL.',
			},
			{ status: 405 }
		);
	}

	const url = new URL(request.url);
	const imageUrl = url.searchParams.get('url');

	// If no image URL, return the cortical mapping as educational content
	if (!imageUrl) {
		return jsonResponse({
			usage: 'GET /api/vision?url=<image_url> to classify an image',
			ventral_stream: visionStages,
			skip_connections: visionSkipConnections,
			key_insight: visionKeyInsight,
			sample_image_url: visionDefaultImageUrl,
		});
	}

	// Validate URL scheme — only allow http/https
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(imageUrl);
	} catch {
		return jsonResponse(
			{
				error: 'Invalid URL',
				details: { url: imageUrl },
				suggestion: 'The provided URL is not valid. Please provide a well-formed URL.',
			},
			{ status: 400 },
		);
	}

	if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
		return jsonResponse(
			{
				error: 'Unsupported URL scheme',
				details: { scheme: parsedUrl.protocol, url: imageUrl },
				suggestion: `Only http:// and https:// URLs are supported. "${parsedUrl.protocol}" URLs cannot be fetched by the server.`,
			},
			{ status: 400 },
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
			return jsonResponse(
				{
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
				},
				{ status: 400 },
			);
		}

		// Check content type to ensure it's an image
		const contentType = imageResponse.headers.get('content-type') || '';
		if (!contentType.startsWith('image/')) {
			return jsonResponse(
				{
					error: 'Invalid content type',
					details: { contentType, url: imageUrl },
					suggestion: 'The URL must point to a valid image file (JPEG, PNG, GIF, WebP, etc.)',
				},
				{ status: 400 },
			);
		}

		const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());

		// Check minimum size (empty or too small)
		if (imageBytes.length < 100) {
			return jsonResponse(
				{
					error: 'Image too small or corrupted',
					details: { size: imageBytes.length, url: imageUrl },
					suggestion: 'The image file appears to be too small or corrupted. Please try a different image.',
				},
				{ status: 400 },
			);
		}

		const results = (await ai.run('@cf/microsoft/resnet-50', {
			image: [...imageBytes],
		})) as VisionClassification[];

		return jsonResponse({
			classifications: results,
			processing_pipeline: visionStages,
			skip_connections: visionSkipConnections,
			interpretation:
				'The labels above are the output of the final "prefrontal" layer. To reach this decision, the image was processed through all 50 layers - from raw pixel edges (V1) to full object representations (IT) to categorical decisions (PFC). Your brain does essentially the same thing in about 150ms.',
		});
	} catch (err: unknown) {
		// Check if the error is due to abort (timeout)
		const message = err instanceof Error ? err.message : 'Unknown error';
		const name = err instanceof Error ? err.name : 'UnknownError';
		const isAbortError = name === 'AbortError' || message === 'The operation was aborted.';

		return jsonResponse(
			{
				error: isAbortError ? 'Request timed out' : 'Request failed',
				details: {
					message,
					isAbort: isAbortError,
					url: imageUrl,
				},
				suggestion: isAbortError
					? 'The request timed out. The image server might be slow or unreachable. Try a different image URL.'
					: 'An error occurred while processing the image. Please check the URL and try again.',
			},
			{ status: isAbortError ? 408 : 500 },
		);
	}
}
