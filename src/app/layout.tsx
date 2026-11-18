import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Digital Sales CRM",
  description: "Professional lead management and sales tracking platform",
  keywords: ["CRM", "sales", "lead management", "business"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", inter.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
