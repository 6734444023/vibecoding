
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export const THEMES = [
    { id: "sunset", name: "Sunset Vibes", bg: "/images/landing-bg.png" },
    { id: "night", name: "Cozy Night", bg: "/images/login-bg.png" },
    { id: "daylight", name: "Sunny Day", bg: "/images/daylight-bg.png" },
    { id: "underwater", name: "Deep Blue", bg: "/images/underwater-bg.png" },
    { id: "rainy", name: "Rainy Window", bg: "/images/rainy-bg.png" },
];

export const TRACKS = [
    { id: "lofi-1", name: "Chill Lofi", src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3" },
    { id: "lofi-2", name: "Summer Breeze", src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-beat-142273.mp3" },
    { id: "piano", name: "Melancholy Piano", src: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73466.mp3?filename=meditation-piano-16962.mp3" },
];

export const CHAT_THEMES = [
    {
        id: "default",
        name: "Classic Vibe",
        type: "image",
        bg: "/images/landing-bg.png",
        bubble: {
            me: "bg-gradient-to-tr from-cyan-500 to-blue-500",
            other: "bg-white/20 backdrop-blur-md border border-white/10"
        }
    },
    {
        id: "neon",
        name: "Neon Nights",
        type: "image",
        bg: "/images/login-bg.png",
        bubble: {
            me: "bg-fuchsia-600 shadow-[0_0_15px_rgba(192,38,211,0.5)] border border-fuchsia-400",
            other: "bg-slate-900/80 border border-cyan-500/50 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        }
    },
    {
        id: "minimal",
        name: "Clean Slate",
        type: "color", // specialized type for solid color or simple gradient
        bg: "linear-gradient(to bottom right, #e0e7ff, #c7d2fe)",
        bubble: {
            me: "bg-slate-800 text-white",
            other: "bg-white text-slate-800 shadow-sm"
        }
    },
    // Video example (using a placeholder, user can replace)
    {
        id: "ocean-motion",
        name: "Ocean Motion",
        type: "video",
        bg: "https://cdn.pixabay.com/vimeo/328229871/waves-23035.mp4?width=1280&hash=123", // Example generic wave video
        bubble: {
            me: "bg-cyan-600/80 backdrop-blur-sm",
            other: "bg-white/30 backdrop-blur-md"
        }
    }
];

interface ThemeContextType {
    currentTheme: typeof THEMES[0];
    currentTrack: typeof TRACKS[0];
    currentChatTheme: typeof CHAT_THEMES[0];
    setTheme: (id: string) => void;
    setTrack: (id: string) => void;
    setChatTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: THEMES[0],
    currentTrack: TRACKS[0],
    currentChatTheme: CHAT_THEMES[0],
    setTheme: () => { },
    setTrack: () => { },
    setChatTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentThemeState] = useState(THEMES[0]);
    const [currentTrack, setCurrentTrackState] = useState(TRACKS[0]);
    const [currentChatTheme, setCurrentChatThemeState] = useState(CHAT_THEMES[0]);

    // Load from local storage on mount (optional but nice)
    useEffect(() => {
        const savedTheme = localStorage.getItem("vibeTheme");
        const savedTrack = localStorage.getItem("vibeTrack");
        const savedChatTheme = localStorage.getItem("vibeChatTheme");

        if (savedTheme) {
            const found = THEMES.find(t => t.id === savedTheme);
            if (found) setCurrentThemeState(found);
        }
        if (savedTrack) {
            const found = TRACKS.find(t => t.id === savedTrack);
            if (found) setCurrentTrackState(found);
        }
        if (savedChatTheme) {
            const found = CHAT_THEMES.find(t => t.id === savedChatTheme);
            if (found) setCurrentChatThemeState(found);
        }
    }, []);

    const setTheme = (id: string) => {
        const found = THEMES.find(t => t.id === id);
        if (found) {
            setCurrentThemeState(found);
            localStorage.setItem("vibeTheme", id);
        }
    };

    const setTrack = (id: string) => {
        const found = TRACKS.find(t => t.id === id);
        if (found) {
            setCurrentTrackState(found);
            localStorage.setItem("vibeTrack", id);
        }
    };

    const setChatTheme = (id: string) => {
        const found = CHAT_THEMES.find(t => t.id === id);
        if (found) {
            setCurrentChatThemeState(found);
            localStorage.setItem("vibeChatTheme", id);
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, currentTrack, currentChatTheme, setTheme, setTrack, setChatTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
