import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@livekit/components-styles";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CreditProvider } from "@/components/providers/credit-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Core Model - Evidence-Based Adaptive Learning",
  description: "Ingest your study materials, build a scientific learner profile, and get adaptive recommendations with explicit uncertainty and full audit trails.",
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
            <AuthProvider>
              <CreditProvider>
                {children}
              </CreditProvider>
            </AuthProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
