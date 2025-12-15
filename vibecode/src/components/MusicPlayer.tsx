"use client";
import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { motion } from "framer-motion";

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
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

    // Auto-play on mount (often blocked by browsers, but we try)
    useEffect(() => {
        const playAudio = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = 0.3; // Low volume for background
                    // await audioRef.current.play(); // Auto-play is tricky, let user interact first
                    // setIsPlaying(true);
                } catch (err) {
                    console.log("Auto-play blocked", err);
                }
            }
        };
        playAudio();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-lg text-white"
        >
            <div className="flex items-center gap-2">
                <Music className="w-5 h-5 animate-pulse text-cyan-300" />
                <span className="text-xs font-medium hidden sm:block">Chill Waves FM</span>
            </div>

            <div className="h-4 w-[1px] bg-white/30 mx-1"></div>

            <button onClick={togglePlay} className="hover:text-cyan-300 transition-colors">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button onClick={toggleMute} className="hover:text-cyan-300 transition-colors">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Placeholder for chill lofi beach music */}
            <audio
                ref={audioRef}
                loop
                src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3"
            />
        </motion.div>
    );
};

export default MusicPlayer;
