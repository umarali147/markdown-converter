import ConverterShell from '@/components/ConverterShell';

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col px-4 py-6 sm:px-6">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Markdown <span className="text-blue-600">⇄</span> Rich Text
          </h1>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            🔒 100% local — nothing is uploaded
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste Markdown. Copy formatted text for Gmail, Word, Google Docs &amp; Notion.
        </p>
      </header>

      <main className="flex-1">
        <ConverterShell />
      </main>

      <footer className="mt-8 border-t border-gray-100 pt-4 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
        Part of{' '}
        <a
          href="https://arttools.live"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400"
        >
          ArtTools.live
        </a>{' '}
        — free tools, no signup, no uploads.
      </footer>
    </div>
  );
}
