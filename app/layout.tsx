import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoGuessr",
  description: "Guess the programming language and framework from a real GitHub snippet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
