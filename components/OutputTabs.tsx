'use client';

import type { OutputTab } from '@/types';

interface OutputTabsProps {
  active: OutputTab;
  onChange: (tab: OutputTab) => void;
}

const TABS: { id: OutputTab; label: string }[] = [
  { id: 'rich', label: 'Rich Text' },
  { id: 'html', label: 'HTML' },
  { id: 'plain', label: 'Plain Text' },
];

export default function OutputTabs({ active, onChange }: OutputTabsProps) {
  return (
    <div role="tablist" aria-label="Output format" className="flex gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            active === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
