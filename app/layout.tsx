import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import TopEcosystemBar from "@/components/TopEcosystemBar";
import { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arena.geturgent2k.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arena — Share Proof of Your Work & Level Up",
    template: "%s | Arena",
  },
  description:
    "Share verified proof of your completed GU2K gigs, showcase field audits and brand activations, climb Arena ranks from Hustler to Lead, and get discovered on Arena.",
  keywords: [
    "Arena",
    "GU2K",
    "GetUrgent2K",
    "proof of work",
    "gig economy",
    "talent proofboard",
    "retail audits",
    "field operations",
    "mystery shopping",
    "verified talent",
  ],
  authors: [{ name: "Arena by GU2K" }],
  creator: "GU2K",
  publisher: "Arena",
  icons: {
    icon: [
      { url: "/icons/gu2k-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icons/gu2k-logo.svg",
    apple: "/icons/gu2k-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Arena",
    title: "Arena — Share Proof of Your Work & Level Up",
    description:
      "Share verified proof of your completed GU2K gigs, build your reputation, and climb the ranks on Arena.",
    images: [
      {
        url: "/images/feed-image-top.png",
        width: 1200,
        height: 416,
        alt: "Arena — Share your work, level up.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena — Share Proof of Your Work & Level Up",
    description:
      "Share verified proof of your completed GU2K gigs, build your reputation, and climb the ranks on Arena.",
    images: ["/images/feed-image-top.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-black bg-white`}>
        <TopEcosystemBar />
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
