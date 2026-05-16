import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
          <main className="mx-auto max-w-lg px-4 pt-4 pb-24 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}