import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMBER RAMEN BAR · Build Your Bowl",
  description:
    "Build a realistic 3D ramen bowl: choose noodles, toppings and broth, watch them drop into the bowl, and send your order to the kitchen.",
};

export const viewport: Viewport = {
  themeColor: "#0a0604",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Zen+Old+Mincho:wght@400;600&family=Courier+Prime:wght@400;700&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="bg-[#0a0604] font-body text-[#f3e6cf] antialiased">{children}</body>
    </html>
  );
}
