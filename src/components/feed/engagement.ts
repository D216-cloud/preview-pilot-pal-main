// Smart-ish dummy engagement based on caption length, hashtags, emojis.
// Pure function — same input always returns same numbers.

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function estimateEngagement(text: string, hasMedia: boolean) {
  const len = text.length;
  const hashtags = (text.match(/#\w+/g) || []).length;
  const emojis = (text.match(EMOJI_RE) || []).length;

  // Sweet spot caption length
  const lengthBoost =
    len < 40 ? 0.6 : len < 120 ? 1.0 : len < 280 ? 1.15 : len < 600 ? 0.85 : 0.6;

  const base = 60 + (hasMedia ? 80 : 0);
  const score =
    base * lengthBoost +
    hashtags * 18 +
    Math.min(emojis, 8) * 9;

  const likes = Math.round(score * 1.6);
  const comments = Math.round(score * 0.18);
  const shares = Math.round(score * 0.08);
  const views = Math.round(score * 24);

  return { likes, comments, shares, views };
}
