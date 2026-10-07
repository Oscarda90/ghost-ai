export const DEFAULT_PROJECT_NAME = "Untitled Project";

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Reads a JSON object body; an empty body parses as `{}`. */
export async function readJsonObject(
  request: Request,
): Promise<ParseResult<Record<string, unknown>>> {
  const text = await request.text();
  if (!text.trim()) return { ok: true, value: {} };

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  return { ok: true, value: body as Record<string, unknown> };
}

/** Create: missing or blank name falls back to the default. */
export function parseCreateName(body: Record<string, unknown>): ParseResult<string> {
  const { name } = body;
  if (name === undefined || name === null) return { ok: true, value: DEFAULT_PROJECT_NAME };
  if (typeof name !== "string") return { ok: false, error: "`name` must be a string" };
  return { ok: true, value: name.trim() || DEFAULT_PROJECT_NAME };
}

const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_ID_MAX_LENGTH = 100;

/**
 * Create: optional client-chosen ID (the Liveblocks room ID) so the two stay
 * aligned. Lowercase alphanumerics separated by single hyphens. Missing →
 * `undefined` (schema cuid default).
 */
export function parseCreateId(body: Record<string, unknown>): ParseResult<string | undefined> {
  const { id } = body;
  if (id === undefined || id === null) return { ok: true, value: undefined };
  if (
    typeof id !== "string" ||
    id.length > PROJECT_ID_MAX_LENGTH ||
    !PROJECT_ID_PATTERN.test(id)
  ) {
    return { ok: false, error: "`id` must be a lowercase hyphenated slug" };
  }
  return { ok: true, value: id };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

/** Invite: required email, trimmed and lowercased so collaborator rows match case-insensitively. */
export function parseCollaboratorEmail(body: Record<string, unknown>): ParseResult<string> {
  const { email } = body;
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!value || value.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
    return { ok: false, error: "Enter a valid email address" };
  }
  return { ok: true, value };
}

/** Rename: name is required and must be non-blank. */
export function parseRenameName(body: Record<string, unknown>): ParseResult<string> {
  const { name } = body;
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "`name` must be a non-empty string" };
  }
  return { ok: true, value: name.trim() };
}
