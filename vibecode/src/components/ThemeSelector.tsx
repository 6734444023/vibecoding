"use client";
import React, { useState } from "react";
import { useTheme, THEMES, TRACKS } from "../context/ThemeContext";
import { Settings, X, Music, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";

const ThemeSelector = () => {
    const { currentTheme, currentTrack, setTheme, setTrack } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white hover:bg-white/20 transition-all"
                onClick={() => setIsOpen(true)}
            >
                <Settings className="w-6 h-6 animate-spin-slow" />
            </motion.button>

            {/* Modal / Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto text-white"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold">Vibe Settings</h2>
                                <button onClick={() => setIsOpen(false)} className="hover:text-cyan-300">
                                    <X />
                                </button>
                            </div>

                            {/* Background Selection */}
                            <div className="mb-8">
                                <h3 className="flex items-center gap-2 font-semibold mb-4 text-cyan-200">
                                    <ImageIcon size={18} /> Background
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {THEMES.map((theme) => (
                                        <div
                                            key={theme.id}
                                            onClick={() => setTheme(theme.id)}
                                            className={`
                        relative cursor-pointer rounded-lg overflow-hidden h-24 border-2 transition-all
                        ${currentTheme.id === theme.id ? "border-cyan-400 scale-105 shadow-cyan-500/50 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}
                      `}
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url('${theme.bg}')` }}
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs font-bold text-center p-1">
                                                {theme.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Music Selection */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-4 text-pink-200">
                                    <Music size={18} /> Music Station
                                </h3>
                                <div className="space-y-2">
                                    {TRACKS.map((track) => (
                                        <button
                                            key={track.id}
                                            onClick={() => setTrack(track.id)}
                                            className={`
                        w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                        ${currentTrack.id === track.id ? "bg-white/10 border-pink-400 text-pink-200" : "border-white/5 hover:bg-white/5 text-white/70"}
                      `}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${currentTrack.id === track.id ? "bg-pink-400 animate-pulse" : "bg-white/20"}`} />
                                            <span className="text-sm font-medium">{track.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
                                VibeChat v1.0 • Stay Chill
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default ThemeSelector;
