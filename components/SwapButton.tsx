'use client';

interface SwapButtonProps {
  onSwap: () => void;
  direction: 'md-to-rich' | 'rich-to-md';
}

export default function SwapButton({ onSwap, direction }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onSwap}
      aria-label={`Switch direction (currently ${
        direction === 'md-to-rich' ? 'Markdown to rich text' : 'rich text to Markdown'
      })`}
      title="Swap conversion direction"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-600 shadow-sm transition-transform hover:scale-110 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
    >
      ⇄
    </button>
  );
}
