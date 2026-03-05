import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@livekit/components-styles";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CreditProvider } from "@/components/providers/credit-provider";
import { SiteConfigProvider } from "@/components/providers/site-config-provider";
import { siteConfig } from "@/lib/white-label";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SiteConfigProvider>
              <AuthProvider>
                <CreditProvider>
                  {children}
                </CreditProvider>
              </AuthProvider>
            </SiteConfigProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
