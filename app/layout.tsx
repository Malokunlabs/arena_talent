import { Toaster } from "@/components/ui/toaster";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arena Talent",
  description: "Marketplace for talent and gigs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} font-sans antialiased`}>
        <Navbar />
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
