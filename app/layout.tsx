import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wavemark",
  description: "Audio Annotation Studio",
};

import { AudioProvider } from "@/lib/AudioContext";

import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.className} antialiased`}>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
