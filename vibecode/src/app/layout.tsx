import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Chill vibe font
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import MusicPlayer from "../components/MusicPlayer";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeChat - Chill Beach Vibes",
  description: "Relax, chat, and vibe with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          <MusicPlayer />
          <main className="min-h-screen relative overflow-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
