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

interface ThemeContextType {
    currentTheme: typeof THEMES[0];
    currentTrack: typeof TRACKS[0];
    setTheme: (id: string) => void;
    setTrack: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: THEMES[0],
    currentTrack: TRACKS[0],
    setTheme: () => { },
    setTrack: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentThemeState] = useState(THEMES[0]);
    const [currentTrack, setCurrentTrackState] = useState(TRACKS[0]);

    // Load from local storage on mount (optional but nice)
    useEffect(() => {
        const savedTheme = localStorage.getItem("vibeTheme");
        const savedTrack = localStorage.getItem("vibeTrack");
        if (savedTheme) {
            const found = THEMES.find(t => t.id === savedTheme);
            if (found) setCurrentThemeState(found);
        }
        if (savedTrack) {
            const found = TRACKS.find(t => t.id === savedTrack);
            if (found) setCurrentTrackState(found);
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

    return (
        <ThemeContext.Provider value={{ currentTheme, currentTrack, setTheme, setTrack }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
