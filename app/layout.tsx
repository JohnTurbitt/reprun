import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.scss";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3002";
const appName = "RepRun";
const appDescription =
  "Analyze HYROX-style race splits, find time leaks, and build a realistic next target.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: appName,
  title: {
    default: "RepRun - Hybrid Race Split Analyzer",
    template: "%s - RepRun",
  },
  description: appDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: appName,
    title: "RepRun - Hybrid Race Split Analyzer",
    description: appDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "RepRun hybrid race split analyzer preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RepRun - Hybrid Race Split Analyzer",
    description: appDescription,
    images: ["/og-image.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
