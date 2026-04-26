import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { WebMCP } from "@/components/web-mcp";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/Provider/ThemeProvider";

const siteUrl = getSiteUrl();
const ogImageUrl = `${siteUrl}/api/og`;

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Serving a Nation | Healthcare Desert Intelligence",
    template: "%s | Serving a Nation",
  },
  description:
    "Identify healthcare specialty deserts across India. Graph RAG powered by Neo4j + Databricks with facility mapping, desert detection, and evidence-grade reporting.",
  applicationName: "Serving a Nation",
  keywords: [
    "healthcare desert",
    "healthcare intelligence",
    "Graph RAG",
    "Neo4j",
    "Databricks",
    "public health analytics India",
    "specialty gap mapping",
    "healthcare infrastructure",
  ],
  authors: [{ name: "Serving a Nation" }],
  creator: "Serving a Nation",
  publisher: "Serving a Nation",
  category: "Healthcare intelligence",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Serving a Nation",
    title: "Serving a Nation | Healthcare Desert Intelligence",
    description:
      "Identify healthcare specialty deserts across India with Graph RAG intelligence, facility mapping, and evidence-grade reporting.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Serving a Nation healthcare intelligence preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serving a Nation | Healthcare Desert Intelligence",
    description:
      "Graph RAG intelligence for India healthcare specialty deserts, facility mapping, and auditable evidence exports.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.classList.add(t)}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})()`;

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
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC prevention — constant string, not user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <WebMCP />
      </body>
    </html>
  );
}
