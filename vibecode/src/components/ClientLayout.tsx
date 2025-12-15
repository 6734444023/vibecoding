"use client";
import React from "react";
import { useTheme } from "../context/ThemeContext";
import MusicPlayer from "./MusicPlayer";
import ThemeSelector from "./ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { currentTheme } = useTheme();

    return (
        <div className="min-h-screen relative overflow-hidden transition-all duration-700 ease-in-out">
            {/* Global Background Layer */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentTheme.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat w-full h-full"
                    style={{ backgroundImage: `url('${currentTheme.bg}')` }}
                >
                    <div className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] ${currentTheme.id === 'daylight' ? 'bg-white/10' : ''}`} />
                </motion.div>
            </AnimatePresence>

            <MusicPlayer />
            <ThemeSelector />

            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
