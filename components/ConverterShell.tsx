'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Direction, OutputTab } from '@/types';
import { mdToHtml, htmlToPlainText } from '@/lib/mdToHtml';
import { htmlToMd } from '@/lib/htmlToMd';
import { copyRichText, copyText } from '@/lib/clipboard';
import { looksLikeMarkdown } from '@/lib/detect';
import MarkdownInput from './MarkdownInput';
import RichTextInput from './RichTextInput';
import OutputTabs from './OutputTabs';
import CopyButton from './CopyButton';
import SwapButton from './SwapButton';

const STORAGE_KEY = 'md-converter-state-v1';

const SAMPLE = `# Welcome 👋

Paste **Markdown** on the left — get *formatted text* on the right.

Perfect for moving AI chatbot answers into Gmail, Word, or Google Docs:

1. Paste Markdown
2. Click **Copy as Rich Text**
3. Paste anywhere — formatting included

| Feature | Supported |
|---------|-----------|
| Tables  | ✅ |
| Lists   | ✅ |
| Code    | \`inline\` and blocks |

> Everything runs in your browser. Nothing is uploaded.`;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ConverterShell() {
  const [direction, setDirection] = useState<Direction>('md-to-rich');
  const [mdInput, setMdInput] = useState('');
  const [richInput, setRichInput] = useState('');
  const [activeTab, setActiveTab] = useState<OutputTab>('rich');
  const [hydrated, setHydrated] = useState(false);
  const restored = useRef(false);

  // Restore from localStorage once, fall back to sample content.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        setDirection(s.direction ?? 'md-to-rich');
        setMdInput(s.mdInput ?? '');
        setRichInput(s.richInput ?? '');
      } else {
        setMdInput(SAMPLE);
      }
    } catch {
      setMdInput(SAMPLE);
    }
    setHydrated(true);
  }, []);

  // Persist (debounced via the conversion debounce below being cheap enough).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ direction, mdInput, richInput }));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [direction, mdInput, richInput, hydrated]);

  const debouncedMd = useDebounced(mdInput, 150);
  const debouncedRich = useDebounced(richInput, 150);

  // md-to-rich outputs
  const renderedHtml = useMemo(
    () => (direction === 'md-to-rich' && hydrated ? mdToHtml(debouncedMd) : ''),
    [direction, debouncedMd, hydrated]
  );
  const plainText = useMemo(
    () => (renderedHtml ? htmlToPlainText(renderedHtml) : ''),
    [renderedHtml]
  );

  // rich-to-md output
  const markdownOut = useMemo(
    () => (direction === 'rich-to-md' && hydrated ? htmlToMd(debouncedRich) : ''),
    [direction, debouncedRich, hydrated]
  );

  const handleSwap = () => {
    if (direction === 'md-to-rich') {
      // Carry the rendered result over as the new input
      setRichInput(renderedHtml);
      setDirection('rich-to-md');
    } else {
      setMdInput(markdownOut);
      setDirection('md-to-rich');
    }
  };

  const handleClear = () => {
    setMdInput('');
    setRichInput('');
  };

  // Auto-detect markdown pasted into the rich pane's plain text
  const handleRichChange = (html: string) => {
    const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
    if (!richInput.trim() && looksLikeMarkdown(text) && !/<(strong|em|h[1-6]|ul|ol|table)\b/i.test(html)) {
      // Pasted raw markdown into the wrong pane — switch direction for them
      setMdInput(text);
      setDirection('md-to-rich');
      return;
    }
    setRichInput(html);
  };

  const outputWordCount = useMemo(() => {
    const text = direction === 'md-to-rich' ? plainText : markdownOut;
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [direction, plainText, markdownOut]);

  const paneClass =
    'flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900';
  const paneHeader =
    'flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800';

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {direction === 'md-to-rich' ? 'Markdown → Rich Text' : 'Rich Text → Markdown'}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Clear
        </button>
      </div>

      {/* Panes */}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Input pane */}
        <section className={paneClass} aria-label="Input">
          <div className={paneHeader}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {direction === 'md-to-rich' ? 'Markdown In' : 'Rich Text In'}
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {direction === 'md-to-rich' ? (
              <MarkdownInput value={mdInput} onChange={setMdInput} />
            ) : (
              <RichTextInput html={richInput} onChange={handleRichChange} />
            )}
          </div>
        </section>

        {/* Swap button — floats between panes */}
        <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <SwapButton onSwap={handleSwap} direction={direction} />
        </div>

        {/* Output pane */}
        <section className={paneClass} aria-label="Output">
          <div className={paneHeader}>
            {direction === 'md-to-rich' ? (
              <>
                <OutputTabs active={activeTab} onChange={setActiveTab} />
                {activeTab === 'rich' && (
                  <CopyButton
                    primary
                    label="Copy as Rich Text"
                    onCopy={() => copyRichText(renderedHtml, plainText)}
                  />
                )}
                {activeTab === 'html' && (
                  <CopyButton label="Copy HTML" onCopy={() => copyText(renderedHtml)} />
                )}
                {activeTab === 'plain' && (
                  <CopyButton label="Copy Text" onCopy={() => copyText(plainText)} />
                )}
              </>
            ) : (
              <>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Markdown Out
                </h2>
                <CopyButton primary label="Copy Markdown" onCopy={() => copyText(markdownOut)} />
              </>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {direction === 'md-to-rich' ? (
              activeTab === 'rich' ? (
                <div
                  className="prose prose-sm max-w-none p-4 dark:prose-invert"
                  // Sanitized by DOMPurify in mdToHtml
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              ) : (
                <pre className="whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                  {activeTab === 'html' ? renderedHtml : plainText}
                </pre>
              )
            ) : (
              <pre className="whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                {markdownOut}
              </pre>
            )}
          </div>
          <div className="border-t border-gray-100 px-4 py-1.5 text-right text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
            {outputWordCount} words
          </div>
        </section>
      </div>
    </div>
  );
}
