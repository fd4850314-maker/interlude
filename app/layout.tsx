import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTERLUDE",
  description: "Don't wait for AI. Use the moment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
