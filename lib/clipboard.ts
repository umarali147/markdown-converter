/**
 * Copy rich text to the clipboard: text/html + text/plain together,
 * so Gmail / Word / Google Docs paste with formatting while plain-text
 * fields get readable text. This is the core feature of the app.
 */
export async function copyRichText(html: string, plain: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  return legacyRichCopy(html);
}

/** Fallback: hidden contenteditable + execCommand('copy'). */
function legacyRichCopy(html: string): boolean {
  const container = document.createElement('div');
  container.contentEditable = 'true';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } finally {
    selection?.removeAllRanges();
    container.remove();
  }
  return ok;
}

/** Copy plain string (markdown / html source / plain text tabs). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
