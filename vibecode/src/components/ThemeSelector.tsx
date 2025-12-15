"use client";
import React, { useState } from "react";
import { useTheme, THEMES, TRACKS, CHAT_THEMES } from "../context/ThemeContext";
import { Settings, X, Music, Image as ImageIcon, MessageCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeSelector = () => {
    const { currentTheme, currentTrack, currentChatTheme, setTheme, setTrack, setChatTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'lobby' | 'chat'>('lobby');

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
                            className="fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto text-white flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Vibe Settings</h2>
                                <button onClick={() => setIsOpen(false)} className="hover:text-cyan-300">
                                    <X />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
                                <button
                                    onClick={() => setActiveTab('lobby')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lobby' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                                >
                                    <ImageIcon size={16} /> Lobby
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-purple-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                                >
                                    <MessageCircle size={16} /> Chat
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === 'lobby' ? (
                                    <>
                                        {/* Lobby Background Selection */}
                                        <div className="mb-8">
                                            <h3 className="flex items-center gap-2 font-semibold mb-4 text-cyan-200">
                                                <ImageIcon size={18} /> Global Background
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {THEMES.map((theme) => (
                                                    <div
                                                        key={theme.id}
                                                        onClick={() => setTheme(theme.id)}
                                                        className={`
                                                            relative cursor-pointer rounded-lg overflow-hidden h-24 border-2 transition-all group
                                                            ${currentTheme.id === theme.id ? "border-cyan-400 scale-105 shadow-cyan-500/50 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}
                                                        `}
                                                    >
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${theme.bg}')` }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs font-bold text-center p-1 group-hover:bg-black/10 transition-colors">
                                                            {theme.name}
                                                        </div>
                                                        {currentTheme.id === theme.id && (
                                                            <div className="absolute top-1 right-1 bg-cyan-500 rounded-full p-0.5">
                                                                <Check size={10} />
                                                            </div>
                                                        )}
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
                                    </>
                                ) : (
                                    <>
                                        {/* Chat Background Selection */}
                                        <div className="mb-4">
                                            <h3 className="flex items-center gap-2 font-semibold mb-4 text-purple-200">
                                                <MessageCircle size={18} /> Chat Style
                                            </h3>
                                            <div className="space-y-3">
                                                {CHAT_THEMES.map((theme) => (
                                                    <div
                                                        key={theme.id}
                                                        onClick={() => setChatTheme(theme.id)}
                                                        className={`
                                                      relative p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 overflow-hidden
                                                      ${currentChatTheme.id === theme.id ? "border-purple-500 bg-white/5 shadow-lg shadow-purple-500/20" : "border-white/10 hover:border-white/30 hover:bg-white/5"}
                                                    `}
                                                    >
                                                        {/* Preview Background */}
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative border border-white/10">
                                                            {theme.type === 'video' ? (
                                                                <video src={theme.bg} muted loop autoPlay className="w-full h-full object-cover" />
                                                            ) : theme.type === 'color' ? (
                                                                <div className="w-full h-full" style={{ background: theme.bg }} />
                                                            ) : (
                                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${theme.bg}')` }} />
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-sm mb-1">{theme.name}</h3>
                                                            {/* Bubble Preview */}
                                                            <div className={`text-xs px-2 py-1 rounded-lg inline-block ${theme.bubble.me}`}>
                                                                Hey! 👋
                                                            </div>
                                                        </div>

                                                        {currentChatTheme.id === theme.id && (
                                                            <div className="p-1 bg-purple-500 rounded-full">
                                                                <Check size={12} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
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
