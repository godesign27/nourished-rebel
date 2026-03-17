export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');

  const words = text.trim().split(/\s+/).length;

  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);

  return Math.max(1, minutes);
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}
