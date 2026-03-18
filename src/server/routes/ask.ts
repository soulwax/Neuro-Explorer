import type { AiClient } from '../ai/client';
import {
	askAvailableLevels,
	askAvailableTopics,
	askExamplePrompts,
	askPromptKits,
	askReasoningRubric,
	askScoreScale,
	askStructuredResponseSchema,
	askTopicContext,
	askLevelOptions,
	askTopicOptions,
	buildAskScoredSystemPrompt,
	buildAskSystemPrompt,
	normalizeAskLevel,
	type AskConfidenceLabel,
	type AskCriterionScore,
	type AskEvaluation,
	type AskScoredResponse,
} from '../../core/ask';
import { corsPreflightResponse, jsonResponse } from '../http';

interface AskRunResponse {
	response?: unknown;
	[key: string]: unknown;
}

const ASK_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const ASK_MAX_SCORE = askReasoningRubric.length * 4;
const FALLBACK_SCORE_FEEDBACK =
	'Structured rubric scoring was unavailable for this answer. Use the shared rubric cards below for manual grading.';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(value: unknown, fallback: string[], minimum = 0, maximum = 4): string[] {
	const items = Array.isArray(value)
		? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
		: [];

	if (items.length >= minimum) {
		return items.slice(0, maximum);
	}

	return fallback.slice(0, Math.min(maximum, fallback.length));
}

function normalizeConfidenceLabel(value: unknown): AskConfidenceLabel {
	return value === 'low' || value === 'moderate' || value === 'high' ? value : 'moderate';
}

function normalizeCriterionScore(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return null;
	}

	return Math.max(0, Math.min(4, Math.round(value)));
}

function unwrapAiResponse(payload: unknown): unknown {
	let current = payload;

	for (let depth = 0; depth < 2; depth += 1) {
		if (!isRecord(current) || current.response === undefined) {
			break;
		}
		current = current.response;
	}

	return current;
}

function parsePotentialJson(payload: unknown): unknown {
	if (typeof payload !== 'string') {
		return payload;
	}

	const trimmed = payload.trim();
	if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
		return payload;
	}

	try {
		return JSON.parse(trimmed);
	} catch {
		return payload;
	}
}

function buildFallbackEvaluation(reason: string): AskEvaluation {
	return {
		scoreAvailable: false,
		overallScore: null,
		maxScore: ASK_MAX_SCORE,
		overallVerdict: 'Structured rubric scoring was unavailable for this response.',
		confidenceLabel: 'low',
		confidenceReason: reason,
		strengths: ['The tutor still generated an answer.', 'The shared rubric remains available for manual grading.'],
		gaps: ['Per-criterion numeric scoring was unavailable.', 'Missed-step detection is provisional until the scorer returns.'],
		nextStep: 'Rerun the question or grade the answer manually against the rubric cards below.',
		changeMindFinding:
			'A new focal sign, formal test result, or temporal clue that materially reorders the localization hierarchy.',
		criterionScores: askReasoningRubric.map((criterion) => ({
			id: criterion.id,
			score: null,
			feedback: FALLBACK_SCORE_FEEDBACK,
			strongestSignal: 'Not auto-scored.',
			missedSignals: criterion.signals.slice(0, 2),
		})),
	};
}

function normalizeCriterionScores(value: unknown): AskCriterionScore[] {
	const items = Array.isArray(value) ? value : [];

	return askReasoningRubric.map((criterion) => {
		const rawMatch = items.find((item) => isRecord(item) && item.id === criterion.id);
		const match = isRecord(rawMatch) ? rawMatch : null;

		return {
			id: criterion.id,
			score: normalizeCriterionScore(match?.score),
			feedback: asNonEmptyString(match?.feedback) ?? 'This reasoning step needs a clearer explicit argument.',
			strongestSignal:
				asNonEmptyString(match?.strongestSignal) ?? 'The strongest completed signal was not identified clearly.',
			missedSignals: normalizeStringArray(match?.missedSignals, criterion.signals.slice(0, 2), 0, 3),
		};
	});
}

function normalizeEvaluation(value: unknown): AskEvaluation {
	if (!isRecord(value)) {
		return buildFallbackEvaluation('Workers AI returned an answer, but no structured scoring object.');
	}

	const criterionScores = normalizeCriterionScores(value.criterionScores);
	const scoreAvailable = criterionScores.every((criterion) => criterion.score !== null);
	const overallScore = scoreAvailable
		? criterionScores.reduce((sum, criterion) => sum + (criterion.score ?? 0), 0)
		: null;

	return {
		scoreAvailable,
		overallScore,
		maxScore: ASK_MAX_SCORE,
		overallVerdict:
			asNonEmptyString(value.overallVerdict) ??
			(scoreAvailable
				? 'Structured rubric scoring completed successfully.'
				: 'Structured rubric scoring was only partially available.'),
		confidenceLabel: normalizeConfidenceLabel(value.confidenceLabel),
		confidenceReason:
			asNonEmptyString(value.confidenceReason) ??
			'The answer did not clearly explain the biggest remaining uncertainty.',
		strengths: normalizeStringArray(
			value.strengths,
			scoreAvailable
				? ['The answer preserves syndrome-first reasoning.', 'The explanation stays clinically actionable.']
				: ['The tutor still produced an answer.', 'The rubric can still guide manual grading.'],
			2,
			4
		),
		gaps: normalizeStringArray(
			value.gaps,
			scoreAvailable
				? ['One or more reasoning steps still need sharper support.', 'Use the criterion cards below to tighten the weakest layer.']
				: ['Structured numeric scoring was incomplete.', 'Some reasoning gaps may require manual review.'],
			2,
			4
		),
		nextStep:
			asNonEmptyString(value.nextStep) ??
			'Ask for the single bedside maneuver, test, or temporal clue that would most efficiently rerank the case.',
		changeMindFinding:
			asNonEmptyString(value.changeMindFinding) ??
			'Any new focal sign or confirmatory test that would force a different localization or mechanism.',
		criterionScores,
	};
}

function normalizeStructuredAskResponse(payload: unknown): AskScoredResponse | null {
	const unwrapped = parsePotentialJson(unwrapAiResponse(payload));
	if (!isRecord(unwrapped)) {
		return null;
	}

	const answer = asNonEmptyString(unwrapped.answer);
	if (!answer) {
		return null;
	}

	return {
		answer,
		evaluation: normalizeEvaluation(unwrapped.evaluation),
	};
}

function extractAnswerText(payload: unknown): string | null {
	const unwrapped = parsePotentialJson(unwrapAiResponse(payload));

	if (typeof unwrapped === 'string') {
		return asNonEmptyString(unwrapped);
	}

	if (!isRecord(unwrapped)) {
		return null;
	}

	return asNonEmptyString(unwrapped.answer) ?? asNonEmptyString(unwrapped.response);
}

function buildSuccessResponse(
	question: string,
	topic: string | null,
	level: string,
	scoredResponse: AskScoredResponse
): Response {
	return jsonResponse({
		topic: topic ?? 'general',
		level,
		question,
		answer: scoredResponse.answer,
		evaluation: scoredResponse.evaluation,
		reasoning_rubric: askReasoningRubric,
		score_scale: askScoreScale,
	});
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
			reasoning_rubric: askReasoningRubric,
			score_scale: askScoreScale,
			prompt_kits: askPromptKits,
			examples: askExamplePrompts.map(
				(example) =>
					`/api/ask?q=${encodeURIComponent(example.question)}&topic=${encodeURIComponent(example.topic)}&level=${encodeURIComponent(example.level)}`
			),
			example_prompts: askExamplePrompts,
		});
	}

	const topicContext =
		topic && askTopicContext[topic] ? `\n\nContext for this topic:\n${askTopicContext[topic]}` : '';

	const scoredMessages = [
		{ role: 'system', content: buildAskScoredSystemPrompt(selectedLevel) + topicContext },
		{ role: 'user', content: question },
	];
	const answerMessages = [
		{ role: 'system', content: buildAskSystemPrompt(selectedLevel) + topicContext },
		{ role: 'user', content: question },
	];
	let structuredFailureReason =
		'Structured rubric scoring did not complete, so the tutor fell back to answer-only mode.';

	try {
		const response = (await ai.run(ASK_MODEL, {
			messages: scoredMessages,
			response_format: {
				type: 'json_schema',
				json_schema: askStructuredResponseSchema,
			},
		})) as AskRunResponse | string;
		const scoredResponse = normalizeStructuredAskResponse(response);

		if (scoredResponse) {
			return buildSuccessResponse(question, topic, selectedLevel, scoredResponse);
		}

		structuredFailureReason =
			'Workers AI returned a response, but it did not match the structured scoring schema.';

		const extractedAnswer = extractAnswerText(response);
		if (extractedAnswer) {
			return buildSuccessResponse(question, topic, selectedLevel, {
				answer: extractedAnswer,
				evaluation: buildFallbackEvaluation(structuredFailureReason),
			});
		}
	} catch (error) {
		structuredFailureReason = error instanceof Error ? error.message : 'Unknown structured-scoring error';
	}

	try {
		const fallbackResponse = (await ai.run(ASK_MODEL, {
			messages: answerMessages,
		})) as AskRunResponse | string;
		const answer = extractAnswerText(fallbackResponse);

		if (!answer) {
			return jsonResponse(
				{
					error: 'Unexpected AI response shape',
					suggestion: 'The tutor answered, but the server could not extract a usable response body.',
					details: {
						structuredScoring: structuredFailureReason,
					},
				},
				{ status: 500 }
			);
		}

		return buildSuccessResponse(question, topic, selectedLevel, {
			answer,
			evaluation: buildFallbackEvaluation(structuredFailureReason),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown AI error';
		return jsonResponse(
			{
				error: message,
				suggestion: 'Check the local `/api/ask` route, AI binding, and Cloudflare Workers AI configuration.',
				details: {
					structuredScoring: structuredFailureReason,
				},
			},
			{ status: 500 }
		);
	}
}
