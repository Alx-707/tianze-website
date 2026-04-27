export type MessageRecord = Record<string, unknown>;

export function readMessagePath(
  messages: MessageRecord,
  path: readonly string[],
  fallback: string,
): string {
  let current: unknown = messages;

  for (const segment of path) {
    if (
      typeof current !== "object" ||
      current === null ||
      !(segment in current)
    ) {
      return fallback;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : fallback;
}
