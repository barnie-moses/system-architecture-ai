import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { signInPath, signUpPath } from "@/lib/auth-routes";
import { clerkAppearance } from "@/lib/clerk-appearance";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "System Architecture AI",
  description: "Collaborative AI-assisted system architecture workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider
          appearance={clerkAppearance}
          signInFallbackRedirectUrl="/editor"
          signInUrl={signInPath}
          signUpFallbackRedirectUrl="/editor"
          signUpUrl={signUpPath}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
