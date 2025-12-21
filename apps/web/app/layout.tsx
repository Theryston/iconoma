import { Geist, Geist_Mono } from "next/font/google";

import "@iconoma/ui/globals.css";
import { Providers } from "@/components/providers";
import { Metadata } from "next";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Iconoma - The best way to standardize icons and SVGs",
  description:
    "Iconoma is a complete icon management system that helps teams organize, standardize, version, and distribute icons with a reliable workflow. Turn your scattered SVG files into a structured, reproducible pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
