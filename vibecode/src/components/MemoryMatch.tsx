"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import { RefreshCw } from "lucide-react";

const EMOJIS = ["🌴", "🌊", "🥥", "🐠", "🐬", "☀️", "🍹", "🌺"];

const MemoryMatch = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [disabled, setDisabled] = useState(false);

    const shuffleCards = () => {
        const duplicatedEmojis = [...EMOJIS, ...EMOJIS];
        const shuffled = duplicatedEmojis
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji }));

        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setDisabled(false);
    };

    useEffect(() => {
        shuffleCards();
    }, []);

    const handleClick = (id: number) => {
        if (disabled || flipped.includes(id) || solved.includes(id)) return;

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        if (flipped.length === 1) {
            setDisabled(true);
            setFlipped([...flipped, id]);

            const firstCard = cards.find(c => c.id === flipped[0]);
            const secondCard = cards.find(c => c.id === id);

            if (firstCard.emoji === secondCard.emoji) {
                setSolved([...solved, flipped[0], id]);
                setFlipped([]);
                setDisabled(false);
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const isWon = solved.length === cards.length && cards.length > 0;

    return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Zen Memory Match</h3>

            <div className="grid grid-cols-4 gap-3 mb-6">
                {cards.map((card) => (
                    <motion.div
                        key={card.id}
                        initial={{ rotateY: 0 }}
                        animate={{
                            rotateY: flipped.includes(card.id) || solved.includes(card.id) ? 180 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleClick(card.id)}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 cursor-pointer"
                        style={{ perspective: "1000px" }}
                    >
                        {/* Front (Hidden) */}
                        <div
                            className={`absolute inset-0 bg-cyan-500/50 rounded-lg flex items-center justify-center border border-white/20 backface-hidden 
              ${flipped.includes(card.id) || solved.includes(card.id) ? "opacity-0" : "opacity-100"}`}
                        >
                            <span className="text-2xl">❓</span>
                        </div>

                        {/* Back (Revealed) */}
                        <div
                            className={`absolute inset-0 bg-white/20 rounded-lg flex items-center justify-center border-2 border-cyan-300 backface-hidden
              ${flipped.includes(card.id) || solved.includes(card.id) ? "opacity-100" : "opacity-0"}`}
                            style={{ transform: "rotateY(180deg)" }}
                        >
                            <span className="text-3xl">{card.emoji}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isWon && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-300 font-bold mb-4 text-center"
                >
                    🎉 Vibes Matched! 🎉
                </motion.div>
            )}

            <Button variant="ghost" onClick={shuffleCards} className="text-sm">
                <RefreshCw size={16} /> Restart
            </Button>
        </div>
    );
};

export default MemoryMatch;
