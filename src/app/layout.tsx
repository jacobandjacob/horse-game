import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Gemini Downs",
  description: "Horse race betting game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gemini Downs",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qrd5xfk.css" />
      </head>
      <body className="antialiased">
        <Providers>
          <main className="min-h-screen pb-28 max-w-md mx-auto">
            {children}
          </main>
          <BottomNav />
          <Toaster position="bottom-center" offset={120} />
        </Providers>
      </body>
    </html>
  );
}
