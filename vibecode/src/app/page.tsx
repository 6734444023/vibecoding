"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/landing-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Floating Elements (Chill Decoration) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl z-10"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl z-10"
      />

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-2xl mx-auto flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 drop-shadow-2xl bg-gradient-to-r from-yellow-200 via-white to-cyan-200 bg-clip-text text-transparent">
            VibeChat
          </h1>
          <p className="text-lg md:text-2xl font-light text-white/90 drop-shadow-md">
            The chillest place to hang out with friends.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/login">
            <Button className="text-lg px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500">
              Start Vibing
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary" className="text-lg px-10 py-4">
              Learn More
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Footer Vibe */}
      <div className="absolute bottom-4 text-center w-full z-20 text-white/50 text-sm">
        <p>Made for relaxation. Turn up the volume.</p>
      </div>
    </div>
  );
}
