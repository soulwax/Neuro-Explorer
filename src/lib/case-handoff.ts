'use client';

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { askAvailableTopics } from '~/lib/ask';
import { getCurriculumModule } from '~/lib/curriculum';

export interface CaseHandoffContext {
  fromSlug: string;
  fromTitle: string;
  caseId: string;
  caseTitle: string;
  prompt: string;
  selectedLabel: string;
  targetLabel: string;
}

export interface CaseHandoffLink {
  slug: string;
  title: string;
  href: string;
  description: string;
}

function normalizeText(value: string | null) {
  return value?.trim() ?? '';
}

function isAskTopic(value: string) {
  return askAvailableTopics.includes(value);
}

export function parseCaseHandoff(
  searchParams: URLSearchParams | ReadonlyURLSearchParams | null,
): CaseHandoffContext | null {
  if (!searchParams) {
    return null;
  }

  if (searchParams.get('handoff') !== 'case') {
    return null;
  }

  const fromSlug = normalizeText(searchParams.get('from'));
  const fromTitle = normalizeText(searchParams.get('fromTitle'));
  const caseId = normalizeText(searchParams.get('caseId'));
  const caseTitle = normalizeText(searchParams.get('caseTitle'));
  const prompt = normalizeText(searchParams.get('prompt'));
  const selectedLabel = normalizeText(searchParams.get('selected'));
  const targetLabel = normalizeText(searchParams.get('target'));

  if (!fromSlug || !fromTitle || !caseId || !caseTitle) {
    return null;
  }

  return {
    fromSlug,
    fromTitle,
    caseId,
    caseTitle,
    prompt,
    selectedLabel,
    targetLabel,
  };
}

export function buildAskHandoffQuestion(context: CaseHandoffContext) {
  const selectedFrame = context.selectedLabel
    ? `My working answer was "${context.selectedLabel}". `
    : '';
  const targetFrame = context.targetLabel
    ? `The best-fit answer was "${context.targetLabel}". `
    : '';
  const promptFrame = context.prompt
    ? `The original prompt was: ${context.prompt} `
    : '';

  return `I just completed the ${context.fromTitle} case "${context.caseTitle}". ${selectedFrame}${targetFrame}${promptFrame}Please walk me through the reasoning hierarchy, explain why the target is stronger, and tell me which next bedside datum would most change the localization.`;
}

export function buildCaseHandoffLinks(
  followUpModules: string[],
  context: CaseHandoffContext,
): CaseHandoffLink[] {
  return followUpModules.flatMap((slug) => {
    const module = getCurriculumModule(slug);
    if (!module) {
      return [];
    }

    const params = new URLSearchParams({
      handoff: 'case',
      from: context.fromSlug,
      fromTitle: context.fromTitle,
      caseId: context.caseId,
      caseTitle: context.caseTitle,
      prompt: context.prompt,
      selected: context.selectedLabel,
      target: context.targetLabel,
    });

    if (slug === 'ask') {
      params.set('question', buildAskHandoffQuestion(context));
      if (isAskTopic(context.fromSlug)) {
        params.set('topic', context.fromSlug);
      }
    }

    return [
      {
        slug,
        title: module.title,
        href: `/${slug}?${params.toString()}`,
        description:
          slug === 'ask'
            ? 'Carry this reveal into a tutor-guided reasoning review.'
            : `Continue the case from ${context.fromTitle} into ${module.title}.`,
      },
    ];
  });
}
