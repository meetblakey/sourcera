import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  description: "Respond securely to buyer software evaluations.",
  title: "Sourcera Seller",
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
        {children}
      </body>
    </html>
  );
}
