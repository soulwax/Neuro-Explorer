import { describe, expect, it } from 'vitest';
import {
	askPromptKits,
	askReasoningRubric,
	askRubricCriterionIds,
	askScoreScale,
	askStructuredResponseSchema,
	buildAskScoredSystemPrompt,
} from '../src/core/ask';

describe('ask teaching layer', () => {
	it('publishes the shared reasoning rubric and prompt kits', () => {
		expect(askReasoningRubric).toHaveLength(6);
		expect(askReasoningRubric.map((criterion) => criterion.id)).toEqual([
			'syndrome',
			'hierarchy',
			'mechanism',
			'alternative',
			'next-data',
			'reversal',
		]);
		expect(askReasoningRubric.every((criterion) => criterion.signals.length >= 3)).toBe(true);
		expect(askPromptKits.map((kit) => kit.moduleSlug)).toEqual(
			expect.arrayContaining(['retina', 'visual-field', 'vision', 'brain-atlas', 'ecg'])
		);
		expect(askPromptKits.every((kit) => kit.question.length > 30)).toBe(true);
		expect(askPromptKits.every((kit) => kit.whyUse.length > 20)).toBe(true);
	});

	it('publishes a complete 0-to-4 scoring scale', () => {
		expect(askScoreScale.map((entry) => entry.score)).toEqual([0, 1, 2, 3, 4]);
		expect(askScoreScale.every((entry) => entry.description.length > 20)).toBe(true);
	});

	it('keeps the structured schema aligned to the rubric ids', () => {
		const criterionScoreItem = (
			askStructuredResponseSchema.properties.evaluation.properties.criterionScores.items as {
				properties: {
					id: { enum: string[] };
				};
			}
		).properties.id;

		expect(criterionScoreItem.enum).toEqual([...askRubricCriterionIds]);
		expect(criterionScoreItem.enum).toHaveLength(askReasoningRubric.length);
	});

	it('builds a scored system prompt that names the JSON scoring contract', () => {
		const prompt = buildAskScoredSystemPrompt('consult-rounds');

		expect(prompt).toContain('Return JSON only');
		expect(prompt).toContain('overallScore');
		expect(prompt).toContain('criterionScores');
		expect(prompt).toContain('changeMindFinding');
	});
});
