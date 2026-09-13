import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mariam Soliman — Creative Developer",
  description:
    "Creative developer crafting identities, interfaces and interactive experiences at the intersection of design and code.",
  keywords: [
    "creative developer",
    "portfolio",
    "React",
    "Three.js",
    "WebGL",
    "GSAP",
    "Cairo Egypt",
    "Mariam Soliman",
  ],
  openGraph: {
    title: "Mariam Soliman — Creative Developer",
    description:
      "An editorial, 3D portfolio of identity, interfaces and interactive work.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
