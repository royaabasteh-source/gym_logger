import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

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
          <main style={{ padding: 24 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}