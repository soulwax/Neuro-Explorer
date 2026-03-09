import { describe, expect, it } from 'vitest';
import { askPromptKits, askReasoningRubric } from '../src/core/ask';

describe('ask teaching layer', () => {
	it('publishes a full shared reasoning rubric', () => {
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
	});

	it('ships prompt kits for the main consult handoff modules', () => {
		expect(askPromptKits.map((kit) => kit.moduleSlug)).toEqual(
			expect.arrayContaining(['retina', 'visual-field', 'vision', 'brain-atlas', 'ecg'])
		);
		expect(askPromptKits.every((kit) => kit.question.length > 30)).toBe(true);
		expect(askPromptKits.every((kit) => kit.whyUse.length > 20)).toBe(true);
	});
});
