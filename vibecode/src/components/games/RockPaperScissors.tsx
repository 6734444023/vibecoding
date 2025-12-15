"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import Button from "../ui/Button";
import { motion } from "framer-motion";
import { X, Hand, Scissors, RotateCcw } from "lucide-react";

interface RPSProps {
    chatId: string;
    myId: string;
    opponentId: string;
    opponentName: string;
    onClose: () => void;
}

const CHOICES = [
    { id: "rock", label: "Rock", icon: "✊" },
    { id: "paper", label: "Paper", icon: "✋" },
    { id: "scissors", label: "Scissors", icon: "✌️" },
];

export default function RockPaperScissors({ chatId, myId, opponentId, opponentName, onClose }: RPSProps) {
    const [gameState, setGameState] = useState<any>(null);

    // Sync Game State
    useEffect(() => {
        const gameRef = doc(db, "chats", chatId, "game", "current");
        const unsub = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                setGameState(doc.data());
            }
        });
        return () => unsub();
    }, [chatId]);

    const handleChoice = async (choiceId: string) => {
        if (!gameState || gameState.roundWinner) return;

        const myKey = myId === gameState.hostId ? "host" : "guest";

        // Prevent changing answer if already chosen? Or allow? Usually lock it.
        if (gameState.choices && gameState.choices[myKey]) return;

        const gameRef = doc(db, "chats", chatId, "game", "current");
        const updates: any = {};
        updates[`choices.${myKey}`] = choiceId;

        // Check if opponent has chosen
        const otherKey = myKey === "host" ? "guest" : "host";
        if (gameState.choices && gameState.choices[otherKey]) {
            // Both picked! Calculate winner
            // We need the opponent's choice locally to calc, or optimistically waiting for state update.
            // But 'gameState' here might be stale for the other player's very recent choice.
            // Actually, we can just set our choice.
            // Then a separate effect or the second player to pick triggers the calculation.

            const p1 = choiceId;
            const p2 = gameState.choices[otherKey];

            let winnerKey = null; // 'host', 'guest', or 'draw'

            if (p1 === p2) winnerKey = "draw";
            else if (
                (p1 === "rock" && p2 === "scissors") ||
                (p1 === "paper" && p2 === "rock") ||
                (p1 === "scissors" && p2 === "paper")
            ) {
                winnerKey = myKey;
            } else {
                winnerKey = otherKey;
            }

            updates.roundWinner = winnerKey;
            // Update scores
            if (winnerKey !== "draw") {
                updates[`scores.${winnerKey}`] = (gameState.scores[winnerKey] || 0) + 1;
            }

            // Auto Reset after delay
            setTimeout(async () => {
                // Only one client needs to trigger reset, usually the one who completed the round.
                await updateDoc(gameRef, {
                    choices: { host: null, guest: null },
                    roundWinner: null
                });
            }, 3000);
        }

        await updateDoc(gameRef, updates);
    };

    if (!gameState) return <div className="text-white p-4">Loading RPS...</div>;

    const myKey = myId === gameState.hostId ? "host" : "guest";
    const myChoice = gameState.choices?.[myKey];
    const otherKey = myKey === "host" ? "guest" : "host";
    const otherChoice = gameState.choices?.[otherKey];
    const roundWinner = gameState.roundWinner;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-slate-800 rounded-3xl border border-white/10 p-6 relative shadow-2xl flex flex-col items-center"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-center text-white mb-6">Rock Paper Scissors</h2>

                {/* Scores */}
                <div className="flex w-full justify-between text-sm text-white/70 mb-8 px-4">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-cyan-400">You</span>
                        <span className="text-2xl">{gameState.scores[myKey]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-pink-400">{opponentName}</span>
                        <span className="text-2xl">{gameState.scores[otherKey]}</span>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex items-center justify-center gap-8 mb-8 min-h-[120px]">
                    {/* My Choice Display */}
                    <div className="text-center">
                        <div className={`text-6xl mb-2 transition-all ${roundWinner ? "scale-110" : ""}`}>
                            {myChoice ? CHOICES.find(c => c.id === myChoice)?.icon : "❓"}
                        </div>
                        {roundWinner && (
                            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">You</div>
                        )}
                    </div>

                    <div className="text-2xl font-bold text-white/20">VS</div>

                    {/* Opponent Choice Display (Hidden unless showdown) */}
                    <div className="text-center">
                        <div className={`text-6xl mb-2 transition-all ${roundWinner ? "scale-110" : ""}`}>
                            {roundWinner ? (
                                CHOICES.find(c => c.id === otherChoice)?.icon
                            ) : otherChoice ? "✅" : "❓"}
                        </div>
                        {roundWinner && (
                            <div className="text-xs font-bold uppercase tracking-widest text-pink-400">{opponentName}</div>
                        )}
                    </div>
                </div>

                {/* Result Message */}
                <div className="h-8 mb-6 text-center">
                    {roundWinner && (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="font-black text-xl text-yellow-400 uppercase">
                            {roundWinner === "draw" ? "It's a Draw!" : roundWinner === myKey ? "You Win!" : "You Lose!"}
                        </motion.div>
                    )}
                    {!roundWinner && otherChoice && !myChoice && (
                        <div className="text-pink-400 animate-pulse">Opponent picked! Your turn...</div>
                    )}
                    {!roundWinner && !otherChoice && !myChoice && (
                        <div className="text-white/30">Make your move...</div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex gap-4 w-full">
                    {CHOICES.map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => handleChoice(choice.id)}
                            disabled={!!myChoice || !!roundWinner}
                            className={`
                                flex-1 py-4 rounded-xl border-2 font-bold text-2xl transition-all
                                ${myChoice === choice.id
                                    ? "bg-cyan-500 border-cyan-400 text-white scale-105 shadow-lg shadow-cyan-500/20"
                                    : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-white/80 hover:-translate-y-1"}
                                ${!!myChoice && myChoice !== choice.id ? "opacity-30 grayscale" : ""}
                            `}
                        >
                            {choice.icon}
                        </button>
                    ))}
                </div>

            </motion.div>
        </div>
    );
}
