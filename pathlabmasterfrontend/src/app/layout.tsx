import type { Metadata } from "next";
import "./globals.css";

import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  title: "Path Lab",
  description: "Path Lab portal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased theme-light">
      <body className="min-h-full flex flex-col">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
