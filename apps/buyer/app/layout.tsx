import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { SourceraConvexProvider } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  description: "Create and run defensible software evaluations.",
  title: "Sourcera Buyer",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
    >
      <body className="bg-background text-foreground antialiased">
        <SourceraConvexProvider>{children}</SourceraConvexProvider>
      </body>
    </html>
  );
}
