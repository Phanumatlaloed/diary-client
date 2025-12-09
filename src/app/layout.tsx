import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Diary App",
  description: "A secure and rich diary application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
