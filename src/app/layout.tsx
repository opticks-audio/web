import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Opticks Audio — Where Physics Becomes Sound",
    template: "%s · Opticks Audio",
  },
  description:
    "Professional audio plugins inspired by the physics of light. The Opticks Collection — REFLEXION, REFRACTION, INFLEXION. For Ableton Live, Logic Pro, Pro Tools and more. VST3, AU, AAX.",
  keywords: [
    "Opticks Audio",
    "audio plugins",
    "VST3",
    "AU",
    "AAX",
    "Ableton Live",
    "Logic Pro",
    "reverb",
    "delay",
    "compressor",
    "Opticks",
    "REFLEXION",
    "REFRACTION",
    "INFLEXION",
  ],
  authors: [{ name: "Opticks Audio" }],
  creator: "Opticks Audio",
  publisher: "Opticks Audio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Opticks Audio",
    title: "Opticks Audio — Where Physics Becomes Sound",
    description:
      "Professional audio plugins inspired by the physics of light. The Opticks Collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opticks Audio — Where Physics Becomes Sound",
    description:
      "Professional audio plugins inspired by the physics of light. The Opticks Collection.",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
