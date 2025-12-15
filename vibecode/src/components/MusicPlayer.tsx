"use client";
import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const MusicPlayer = () => {
    const { currentTrack } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Effect to handle track changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentTrack.src;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Play interrupted by load", e));
            }
        }
    }, [currentTrack]); // isPlaying is removed to avoid loop, we only react to track change

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Play failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Auto-play attempt on mount (low volume)
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-lg text-white"
        >
            <div className="flex items-center gap-2">
                <Music className="w-5 h-5 animate-pulse text-cyan-300" />
                <span className="text-xs font-medium hidden sm:block w-24 truncate">{currentTrack.name}</span>
            </div>

            <div className="h-4 w-[1px] bg-white/30 mx-1"></div>

            <button onClick={togglePlay} className="hover:text-cyan-300 transition-colors">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button onClick={toggleMute} className="hover:text-cyan-300 transition-colors">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <audio
                ref={audioRef}
                loop
                src={currentTrack.src}
            />
        </motion.div>
    );
};

export default MusicPlayer;
