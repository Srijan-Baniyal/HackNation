import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "San Studio | High-Performance Digital Experiences",
  description:
    "A fast, design-forward website built with React Server Components and modern Next.js best practices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "h-full",
        "antialiased",
        displayFont.variable,
        bodyFont.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
      lang="en"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
