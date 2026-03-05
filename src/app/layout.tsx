import type { Metadata } from "next";
import "./globals.css";
import "@livekit/components-styles";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CreditProvider } from "@/components/providers/credit-provider";
import { SiteConfigProvider } from "@/components/providers/site-config-provider";
import { siteConfig } from "@/lib/white-label";

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
