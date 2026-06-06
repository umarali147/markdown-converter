'use client';

import { useEffect, useRef } from 'react';

interface RichTextInputProps {
  /** Current HTML value (only used to clear / restore, not on every keystroke). */
  html: string;
  onChange: (html: string) => void;
}

/**
 * contenteditable pane that captures formatted pastes from Word / Google Docs /
 * web pages and reports its HTML upward.
 */
export default function RichTextInput({ html, onChange }: RichTextInputProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external resets (clear button, direction swap) without clobbering typing.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== html && document.activeElement !== el) {
      el.innerHTML = html;
    }
  }, [html]);

  return (
    <div
      ref={ref}
      contentEditable
      role="textbox"
      aria-multiline="true"
      aria-label="Rich text input — paste formatted content here"
      data-placeholder="Paste formatted text from Word, Google Docs, or a web page here…"
      onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      className="prose prose-sm h-full max-w-none overflow-auto p-4 text-gray-900 focus:outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] dark:prose-invert dark:text-gray-100 dark:empty:before:text-gray-600"
      suppressContentEditableWarning
    />
  );
}
