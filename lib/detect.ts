/**
 * Heuristic: does this plain text look like Markdown?
 * Used to auto-select the md-to-rich direction on paste.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || text.length < 3) return false;

  let score = 0;
  if (/(^|\n)#{1,6}\s+\S/.test(text)) score += 2; // headings
  if (/\*\*[^*\n]+\*\*/.test(text)) score += 2; // bold
  if (/(^|\n)\s*[-*+]\s+\S/.test(text)) score += 1; // bullet lists
  if (/(^|\n)\s*\d+\.\s+\S/.test(text)) score += 1; // ordered lists
  if (/\[[^\]\n]+\]\([^)\n]+\)/.test(text)) score += 2; // links
  if (/(^|\n)```/.test(text)) score += 2; // code fences
  if (/(^|\n)\|.+\|.*\n\|[\s:|-]+\|/.test(text)) score += 3; // tables
  if (/(^|\n)>\s+\S/.test(text)) score += 1; // blockquotes
  if (/`[^`\n]+`/.test(text)) score += 1; // inline code
  if (/(^|\n)\s*[-*+]\s+\[[ x]\]/i.test(text)) score += 2; // task lists

  return score >= 2;
}
