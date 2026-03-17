'use client';

import { useEffect, useMemo, useState } from 'react';

const CASE_PROGRESS_STORAGE_KEY = 'neuro-explorer.case-progress.v1';

export interface CaseAttemptRecord {
  caseId: string;
  caseTitle: string;
  correct: boolean;
  selectedLabel: string;
  targetLabel: string;
  revealedAt: string;
}

interface CaseProgressStore {
  [moduleSlug: string]: Record<string, CaseAttemptRecord>;
}

export interface CaseAttemptInput {
  caseId: string;
  caseTitle: string;
  correct: boolean;
  selectedLabel: string;
  targetLabel: string;
}

export interface ModuleCaseProgressSummary {
  completedCount: number;
  correctCount: number;
  totalCases: number;
  accuracyPercent: number;
  lastAttempt: CaseAttemptRecord | null;
}

function readProgressStore(): CaseProgressStore {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CASE_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as CaseProgressStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgressStore(store: CaseProgressStore) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CASE_PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Best-effort only.
  }
}

export function useCaseProgress(moduleSlug: string, totalCases: number) {
  const [attemptsByCase, setAttemptsByCase] = useState<Record<
    string,
    CaseAttemptRecord
  >>({});

  useEffect(() => {
    setAttemptsByCase(readProgressStore()[moduleSlug] ?? {});
  }, [moduleSlug]);

  const summary = useMemo<ModuleCaseProgressSummary>(() => {
    const attempts = Object.values(attemptsByCase).sort((left, right) =>
      right.revealedAt.localeCompare(left.revealedAt),
    );
    const completedCount = attempts.length;
    const correctCount = attempts.filter((attempt) => attempt.correct).length;

    return {
      completedCount,
      correctCount,
      totalCases,
      accuracyPercent:
        completedCount > 0
          ? Math.round((correctCount / completedCount) * 100)
          : 0,
      lastAttempt: attempts[0] ?? null,
    };
  }, [attemptsByCase, totalCases]);

  function recordAttempt(input: CaseAttemptInput) {
    setAttemptsByCase((current) => {
      const nextAttempt: CaseAttemptRecord = {
        ...input,
        revealedAt: new Date().toISOString(),
      };
      const next = {
        ...current,
        [input.caseId]: nextAttempt,
      };
      const store = readProgressStore();
      store[moduleSlug] = next;
      writeProgressStore(store);
      return next;
    });
  }

  function resetProgress() {
    setAttemptsByCase(() => {
      const store = readProgressStore();
      delete store[moduleSlug];
      writeProgressStore(store);
      return {};
    });
  }

  return {
    attemptsByCase,
    summary,
    recordAttempt,
    resetProgress,
  };
}
