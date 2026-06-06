import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import DOMPurify from 'dompurify';

let service: TurndownService | null = null;

function getService(): TurndownService {
  if (service) return service;
  service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  });
  service.use(gfm);
  return service;
}

/**
 * Clean up the messy HTML that Word / Google Docs / Outlook produce
 * before handing it to turndown.
 */
function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove Office namespace tags (<o:p>), comments, style/meta junk
  doc.querySelectorAll('style, meta, link, xml').forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    if (el.tagName.includes(':') || el.tagName.toLowerCase() === 'o:p') {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  // Normalize styled spans into semantic tags, then unwrap them
  doc.body.querySelectorAll('span, font').forEach((el) => {
    const style = (el.getAttribute('style') ?? '').toLowerCase();
    const weight = /font-weight\s*:\s*(bold|[6-9]00)/.test(style);
    const italic = /font-style\s*:\s*italic/.test(style);
    let replacement: Element | null = null;
    if (weight && italic) {
      replacement = doc.createElement('strong');
      const em = doc.createElement('em');
      em.append(...Array.from(el.childNodes));
      replacement.appendChild(em);
    } else if (weight) {
      replacement = doc.createElement('strong');
      replacement.append(...Array.from(el.childNodes));
    } else if (italic) {
      replacement = doc.createElement('em');
      replacement.append(...Array.from(el.childNodes));
    }
    if (replacement) {
      el.replaceWith(replacement);
    } else {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  // Strip class/style/mso attributes everywhere
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (!['href', 'src', 'alt', 'colspan', 'rowspan'].includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }
  });

  // Drop empty paragraphs Word loves to insert
  doc.body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  });

  return doc.body.innerHTML;
}

/**
 * Convert (possibly messy) HTML to clean GFM Markdown.
 * Client-side only.
 */
export function htmlToMd(html: string): string {
  if (!html.trim()) return '';
  const sanitized = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const cleaned = cleanPastedHtml(sanitized);
  return getService().turndown(cleaned).trim();
}
