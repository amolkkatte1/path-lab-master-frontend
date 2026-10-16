
import type { Metadata } from "next";
import "./globals.css";

import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://pathlabmaster.com"),

  title: {
    default:
      "PathLabMaster | AI-Powered Pathology Lab Management Software",
    template: "%s | PathLabMaster",
  },

  description:
    "PathLabMaster is an online pathology lab management software designed to simplify diagnostic laboratory operations. Features include easy patient registration, quick test registration, AI-powered CBC auto-filling using OCR from uploaded or captured analyzer images, referral doctor management, laboratory calculations, one-click monthly report generation, and easy data analysis. Its user-friendly interface supports desktop and mobile web browsers, with multiple users per laboratory and access controls. Manage patient records, laboratory tests, and diagnostic reports from one convenient platform with a focus on data security and long-term record management.",

  applicationName: "PathLabMaster",

  keywords: [
    "PathLabMaster",
    "pathlabmaster.com",
    "path lab management software",
    "path lab master",
    "pathology lab management software",
    "Clinical lab management software",
    "online pathology software",
    "AI-powered CBC OCR",
    "CBC auto filling",
    "CBC analyzer image OCR",
    "patient registration software",
    "laboratory test registration",
    "referral doctor management",
    "laboratory calculations",
    "one-click monthly reports",
    "laboratory data analysis",
    "multi-user lab software",
    "laboratory access controls",
    "mobile-friendly pathology software",
    "diagnostic laboratory software India",
  ],

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    title:
      "PathLabMaster | AI-Powered Pathology Lab Management Software",
    description:
      "Manage patients, register tests quickly, extract CBC details from analyzer images using AI-powered OCR, manage referral doctors, perform laboratory calculations, and generate monthly reports with PathLabMaster.",
    url: "https://pathlabmaster.com",
    siteName: "PathLabMaster",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PathLabMaster | Pathology Lab Management Software",
    description:
      "Simplify pathology lab operations with patient registration, quick test registration, AI-powered CBC OCR, monthly reports, data analysis, and multi-user access controls.",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased theme-light">
      <body className="min-h-full flex flex-col">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}

