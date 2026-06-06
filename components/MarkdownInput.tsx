'use client';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownInput({ value, onChange }: MarkdownInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={'Paste your Markdown here…\n\n# Heading\n**bold**, *italic*, [links](https://example.com)\n\n| Tables | Work |\n|--------|------|\n| Yes    | They do |'}
      aria-label="Markdown input"
      spellCheck={false}
      className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-600"
    />
  );
}
