import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CreditProvider } from "@/components/providers/credit-provider";

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
    <html lang="en">
      <body>
        <AuthProvider>
          <CreditProvider>
            {children}
          </CreditProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
