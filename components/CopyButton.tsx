'use client';

import { useState } from 'react';

interface CopyButtonProps {
  onCopy: () => Promise<boolean>;
  label: string;
  primary?: boolean;
}

export default function CopyButton({ onCopy, label, primary = false }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleClick = async () => {
    const ok = await onCopy();
    setState(ok ? 'copied' : 'error');
    setTimeout(() => setState('idle'), 2000);
  };

  const base =
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
  const styles = primary
    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700';

  return (
    <button type="button" onClick={handleClick} className={`${base} ${styles}`}>
      <span aria-live="polite">
        {state === 'copied' ? '✓ Copied!' : state === 'error' ? 'Copy failed' : label}
      </span>
    </button>
  );
}
