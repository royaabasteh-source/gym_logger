import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LIFTLOG PRO | Elite Performance Tracking",
  description: "The precision-engineered interface for serious athletes and performance monitoring.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LiftLog Pro",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} selection:bg-accent/30 selection:text-white`}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <AuthGuard>
                <div className="relative min-h-screen overflow-x-hidden">
                  {/* Global Architectural Glow */}
                  <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,45,85,0.05)_0%,transparent_50%)] pointer-events-none z-0" />
                  
                  <main className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 pt-6 pb-32">
                    {children}
                  </main>
                  <BottomNav />
                </div>
              </AuthGuard>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}