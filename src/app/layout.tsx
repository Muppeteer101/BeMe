import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Marketing Machine",
  description: "AI-powered marketing automation for any business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
