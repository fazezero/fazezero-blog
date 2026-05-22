const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(text: string | undefined | null): number | null {
  if (!text?.trim()) {
    return null;
  }

  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number | null): string | null {
  if (minutes === null) {
    return null;
  }

  return `${minutes} min read`;
}
