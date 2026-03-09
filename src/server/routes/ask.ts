import type { AiClient } from '../ai/client';
import {
	askAvailableLevels,
	askAvailableTopics,
	buildAskSystemPrompt,
	normalizeAskLevel,
	askExamplePrompts,
	askTopicContext,
	askLevelOptions,
	askTopicOptions,
} from '../../core/ask';
import { corsPreflightResponse, jsonResponse } from '../http';

interface AskResponse {
	response?: string;
	[key: string]: unknown;
}

export async function handleAsk(request: Request, ai: AiClient): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return corsPreflightResponse();
	}

	if (request.method !== 'GET' && request.method !== 'POST') {
		return jsonResponse(
			{
				error: 'Method not allowed',
				suggestion: 'Use GET /api/ask?q=<question>&topic=<optional_topic> or POST JSON with question/topic.',
			},
			{ status: 405 }
		);
	}

	const url = new URL(request.url);
	let topic = url.searchParams.get('topic');
	let question = url.searchParams.get('q');
	let level = url.searchParams.get('level');

	// Support POST body for longer questions
	if (request.method === 'POST') {
		try {
			const body = (await request.json()) as { q?: string; question?: string; topic?: string; level?: string };
			question = body.q ?? body.question ?? question;
			topic = body.topic ?? topic;
			level = body.level ?? level;
		} catch {
			// ignore parse errors, use query params
		}
	}

	const selectedLevel = normalizeAskLevel(level);

	if (!question) {
		return jsonResponse({
			usage: 'GET /api/ask?q=<question>&topic=<optional_topic>&level=<optional_level>',
			topics: askAvailableTopics,
			topic_options: askTopicOptions,
			levels: askAvailableLevels,
			level_options: askLevelOptions,
			examples: askExamplePrompts.map(
				(example) =>
					`/api/ask?q=${encodeURIComponent(example.question)}&topic=${encodeURIComponent(example.topic)}&level=${encodeURIComponent(example.level)}`
			),
			example_prompts: askExamplePrompts,
		});
	}

	const topicContext =
		topic && askTopicContext[topic] ? `\n\nContext for this topic:\n${askTopicContext[topic]}` : '';

	const messages = [
		{ role: 'system', content: buildAskSystemPrompt(selectedLevel) + topicContext },
		{ role: 'user', content: question },
	];

	try {
		const response = (await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages })) as AskResponse | string;
		const answer = typeof response === 'string' ? response : response.response ?? JSON.stringify(response);

		return jsonResponse({
			topic: topic ?? 'general',
			level: selectedLevel,
			question,
			answer,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown AI error';
		return jsonResponse({ error: message }, { status: 500 });
	}
}
