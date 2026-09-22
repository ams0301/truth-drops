import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sugarcube.app"),
  title: {
    default: "SugarCube — Rescue a sweet tonight 🍰",
    template: "%s · SugarCube",
  },
  description:
    "SugarCube lets bakeries & sweet shops sell leftover treats at dreamy discounts. Rescue a sweet tonight and save it from going to waste.",
  applicationName: "SugarCube",
  keywords: ["bakery", "leftover", "sweets", "mithai", "rescue", "discount", "food waste", "India"],
  authors: [{ name: "SugarCube" }],
  openGraph: {
    title: "SugarCube — Rescue a sweet tonight 🍰",
    description: "Bakery leftover marketplace. Rescue fresh treats at 40–70% off before they go to waste.",
    type: "website",
    siteName: "SugarCube",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFD9C4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
