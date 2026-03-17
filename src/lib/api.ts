type QueryValue = string | number | boolean | null | undefined;

export interface ApiErrorInfo {
  message: string;
  suggestion?: string;
  details?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeApiPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.startsWith("/api/") ? normalized : `/api${normalized}`;
}

export function buildApiUrl<T extends object>(
  path: string,
  query?: T,
): string {
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(
      query as Record<string, QueryValue>,
    )) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      searchParams.set(key, String(value));
    }
  }

  const pathname = normalizeApiPath(path);
  return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
}

export function describeApiTarget() {
  return "internal Next.js route handlers";
}

export function extractApiError(
  payload: unknown,
  fallbackMessage: string,
): ApiErrorInfo {
  if (!isRecord(payload)) {
    return { message: fallbackMessage };
  }

  const message =
    typeof payload.error === "string" && payload.error.trim().length > 0
      ? payload.error
      : fallbackMessage;

  const suggestion =
    typeof payload.suggestion === "string" ? payload.suggestion : undefined;

  let details: string | undefined;
  if ("details" in payload && payload.details !== undefined) {
    try {
      details = JSON.stringify(payload.details, null, 2);
    } catch {
      details = String(payload.details);
    }
  }

  return { message, suggestion, details };
}
