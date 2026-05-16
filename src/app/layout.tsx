import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Gym Logger",
  description: "Gym Logger App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <AuthGuard>
                <main className="mx-auto max-w-lg px-4 pt-4 pb-24 min-h-screen">
                  {children}
                </main>
                <BottomNav />
              </AuthGuard>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}