import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Markdown to Rich Text Converter — Free, No Upload",
  description:
    "Convert Markdown to formatted rich text and paste it into Gmail, Word, Google Docs or Notion with formatting intact. Also converts rich text back to Markdown. 100% in your browser — nothing is uploaded.",
  keywords: [
    "markdown to rich text",
    "markdown converter",
    "markdown to word",
    "markdown to google docs",
    "copy chatgpt output formatted",
    "html to markdown",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
