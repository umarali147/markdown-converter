import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Convert Markdown (GFM) to sanitized HTML.
 * Client-side only — DOMPurify needs a DOM.
 */
export function mdToHtml(markdown: string): string {
  if (!markdown.trim()) return '';
  const raw = marked.parse(markdown, { async: false });
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

/** Strip all tags for the plain-text output tab. */
export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Preserve some structure: line breaks between block elements
  doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, blockquote, pre').forEach((el) => {
    el.appendChild(doc.createTextNode('\n'));
  });
  doc.querySelectorAll('br').forEach((el) => {
    el.replaceWith(doc.createTextNode('\n'));
  });
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}
