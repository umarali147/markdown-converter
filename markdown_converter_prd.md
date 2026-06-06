# Product Requirements Document: Markdown ↔ Rich Text Converter

## Project Overview
A Next.js web application that converts Markdown to clean rich text (and back) so users can paste AI chatbot output into Gmail, Word, Google Docs, Notion, or Outlook with formatting intact — headings, bold, lists, tables, links — instead of raw `**asterisks**` and `#` symbols.

**Positioning**: The fastest paste-convert-copy loop possible. The core flow must take under 5 seconds. Primary audience: anyone copying ChatGPT/Claude/Gemini output into "normal" documents and email.

---

## Core Features

### 1. Markdown → Rich Text (primary direction)
- **Input pane**: paste or type Markdown
- **Output pane**: live rendered rich text preview (updates as you type)
- **"Copy as Rich Text" button**: writes `text/html` + `text/plain` to clipboard so paste targets (Gmail, Word, Docs) keep formatting
- Supported syntax (GitHub-Flavored Markdown):
  - Headings, bold, italic, strikethrough, inline code
  - Ordered/unordered/nested lists, task lists
  - Tables (critical — AI output is full of them)
  - Links, blockquotes, horizontal rules, code blocks
- Auto-detect: if pasted text contains Markdown markers, no mode switch needed

### 2. Rich Text → Markdown (reverse direction)
- Paste formatted content from Word/Docs/web into a contenteditable input pane
- Converts to clean Markdown in output pane
- Handles the messy HTML that Word/Docs produce (style attributes, spans, `<o:p>` tags)
- "Copy Markdown" button

### 3. Secondary Outputs
- Tabs on the output pane:
  - **Rich Text** (default, with Copy as Rich Text)
  - **HTML** (clean source, with copy)
  - **Plain Text** (formatting stripped — for character-limited fields)
- Word count / character count per pane

### 4. Quality-of-Life
- Direction swap button (⇄) preserving content
- "Clear" button; sample content on first visit
- Optional inline-styles mode for HTML output (email clients ignore CSS classes)
- Everything works without signup; content persists in localStorage across reloads

---

## Technical Requirements

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (+ `@tailwindcss/typography` for the preview)
- **Conversion** (all client-side):
  - `marked` or `remark` + `remark-gfm` — Markdown → HTML
  - `turndown` + `turndown-plugin-gfm` — HTML → Markdown
  - `DOMPurify` — sanitize all HTML in both directions
  - Clipboard API: `navigator.clipboard.write()` with `ClipboardItem` (`text/html` + `text/plain`)
  - `juice`-style inline-styling step for the email-safe HTML mode

### File Structure
```
/app
  /page.tsx                 # Single-page converter
  /layout.tsx
/components
  /ConverterShell.tsx       # Two-pane layout + direction state
  /MarkdownInput.tsx        # Textarea with paste handling
  /RichTextInput.tsx        # contenteditable for reverse direction
  /OutputTabs.tsx           # Rich Text / HTML / Plain tabs
  /CopyButton.tsx           # Clipboard logic with success feedback
  /SwapButton.tsx
/lib
  /mdToHtml.ts              # marked/remark pipeline + sanitize
  /htmlToMd.ts              # turndown pipeline + Word/Docs cleanup
  /clipboard.ts             # ClipboardItem rich copy + fallbacks
  /inlineStyles.ts          # email-safe style inlining
  /detect.ts                # Markdown auto-detection heuristics
/types
  /index.ts
```

### Key Implementation Notes

#### Rich Copy (the make-or-break feature)
- `navigator.clipboard.write([new ClipboardItem({ 'text/html': ..., 'text/plain': ... })])`
- Fallback for older browsers: hidden contenteditable + `document.execCommand('copy')`
- Must verify paste fidelity into: Gmail, Outlook web, Word, Google Docs, Notion, Slack

#### Word/Docs HTML Cleanup (reverse direction)
- Strip `mso-` styles, `<o:p>`, empty spans, class soup before turndown
- Normalize `<b>/<i>` vs styled spans; preserve table structure

#### Markdown Detection Heuristics
- Score pasted text for `**`, `# `, `- `, `|---|`, ``` fences, `[text](url)`
- Above threshold → treat as Markdown automatically

---

## Data Schema

```typescript
type Direction = 'md-to-rich' | 'rich-to-md';
type OutputTab = 'rich' | 'html' | 'plain';

interface ConverterState {
  direction: Direction;
  input: string;             // markdown source or captured HTML
  activeTab: OutputTab;
  emailSafeHtml: boolean;    // inline styles toggle
}
```

---

## User Flow (primary)

1. **Landing**: Two panes; left input focused, sample content shows the value instantly
2. **Paste**: User pastes AI output → right pane renders formatted preview live
3. **Copy**: User clicks "Copy as Rich Text" → success state ("Copied — paste into Gmail/Word/Docs")
4. **Paste elsewhere**: Formatting carries over. Done in < 5 seconds total.

---

## UI/UX Requirements

### Layout
- **Desktop**: side-by-side panes with swap button between, sticky copy button
- **Mobile**: stacked panes, input on top, floating copy button
- Header with app title + one-line value prop ("Paste Markdown. Copy formatted text.")

### Design Principles
- Zero configuration required for the main flow — paste and copy must just work
- The Copy button is the hero element: large, sticky, with clear success feedback
- Live preview, no "Convert" button (debounced ~150ms)
- Clean, minimal interface consistent with ArtTools design language

### Accessibility
- Both panes keyboard-reachable and labelled
- Copy success announced via ARIA live region
- Focus indicators; minimum contrast ratio 4.5:1

---

## Performance Requirements

- Live preview update: < 50ms for typical documents (< 50KB)
- Handle 1MB+ pasted documents without freezing (debounce + defer)
- Initial bundle small — this tool should load near-instantly (< 100KB JS gzipped target)

---

## Security & Privacy

- **No server processing**: all conversion client-side; no API routes touch content
- **No data collection**: text never leaves user's browser
- **Sanitize all HTML** with DOMPurify in both directions (pasted HTML and rendered output)
- localStorage persistence is local-only; "Clear" wipes it

---

## Future Enhancements (Out of Scope for V1)

- Export as .docx / .pdf / .html file download
- URL-shared snippets (would require a backend — deliberate V1 exclusion)
- Syntax-highlighted code blocks in rich output
- Slack/Discord/Jira-flavored output modes
- Browser extension for in-place conversion
- Batch file conversion (.md files → .html)

---

## Acceptance Criteria

✅ Pasting GFM Markdown (incl. tables, task lists, code blocks) renders correctly in preview  
✅ "Copy as Rich Text" pastes with formatting intact into Gmail, Google Docs, and Word  
✅ Pasting from Word/Google Docs produces clean Markdown (no `mso-` junk, tables preserved)  
✅ HTML tab outputs sanitized, readable HTML; email-safe mode inlines styles  
✅ Live preview with no convert button; large inputs don't freeze the UI  
✅ Auto-detects Markdown in pasted plain text  
✅ Content survives a page reload (localStorage)  
✅ Works entirely client-side  
✅ Core flow (paste → copy) achievable in under 5 seconds  

---

## Development Phases

### Phase 1: Core Setup
- Next.js init, two-pane layout, Tailwind + typography plugin

### Phase 2: MD → Rich
- marked/remark + GFM pipeline, sanitization, live preview
- ClipboardItem rich copy with fallback

### Phase 3: Reverse Direction
- contenteditable input, turndown pipeline, Word/Docs HTML cleanup

### Phase 4: Output Tabs & Modes
- HTML / Plain tabs, email-safe inline styles, auto-detection

### Phase 5: Polish
- localStorage persistence, mobile layout, accessibility, paste-fidelity testing matrix

---

## Notes for Claude AI Code Generation

1. **The rich clipboard copy is the entire product** — implement and test `ClipboardItem` with `text/html` first; everything else is secondary
2. **All processing client-side**; no API routes for content
3. **Sanitize with DOMPurify everywhere** — both pasted HTML and generated HTML
4. **Use `@tailwindcss/typography`** (`prose` classes) for the preview pane
5. **Debounce the live conversion**; never convert on every keystroke for large docs
6. **Test the Word-paste cleanup against real Word HTML** — it is far messier than spec HTML
7. **TypeScript strictly** with proper interfaces
8. **Keep the bundle lean** — this tool's edge is loading instantly

---

**Document Version**: 1.0  
**Last Updated**: June 6, 2026  
**Status**: Ready for Development
