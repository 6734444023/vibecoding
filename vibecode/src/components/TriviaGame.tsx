"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import Button from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle, XCircle, Timer, Play } from "lucide-react";
import Image from "next/image";

// Simple Trivia Questions (could be moved to a separate file or API)
const QUESTIONS = [
    { q: "What is the capital of France?", a: ["Paris", "London", "Berlin", "Madrid"], correct: "Paris" },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: "Mars" },
    { q: "What is 2 + 2?", a: ["3", "4", "5", "6"], correct: "4" },
    { q: "Who wrote 'Romeo and Juliet'?", a: ["Dickens", "Shakespeare", "Hemingway", "Austen"], correct: "Shakespeare" },
    { q: "What is the largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: "Pacific" },
];

interface TriviaGameProps {
    chatId: string;
    myId: string;
    opponentId: string;
    opponentName: string;
    onClose: () => void;
}

export default function TriviaGame({ chatId, myId, opponentId, opponentName, onClose }: TriviaGameProps) {
    const [gameState, setGameState] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

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

    // Handle Answer
    const handleAnswer = async (answer: string) => {
        if (selectedAnswer || !gameState) return;
        setSelectedAnswer(answer);

        const isCorrect = answer === QUESTIONS[gameState.currentQIndex].correct;
        const myKey = myId === gameState.hostId ? "host" : "guest";

        // Update score and answer status
        const gameRef = doc(db, "chats", chatId, "game", "current");
        const updates: any = {};
        updates[`answers.${myKey}`] = answer;
        if (isCorrect) {
            updates[`scores.${myKey}`] = (gameState.scores[myKey] || 0) + 10;
        }

        // Check if both answered to proceed
        // We can do this optimistically or wait for backend trigger. 
        // To keep it simple client-side: check if other has answered.
        const otherKey = myKey === "host" ? "guest" : "host";
        if (gameState.answers && gameState.answers[otherKey]) {
            // Both answered! Move to next question after delay
            setTimeout(async () => {
                if (gameState.currentQIndex < QUESTIONS.length - 1) {
                    await updateDoc(gameRef, {
                        currentQIndex: gameState.currentQIndex + 1,
                        answers: { host: null, guest: null } // Reset answers
                    });
                } else {
                    await updateDoc(gameRef, { status: "finished" });
                }
            }, 2000); // 2 second delay to see processing
        }

        await updateDoc(gameRef, updates);
    };

    if (!gameState) return <div className="text-white p-4">Loading Game...</div>;

    if (gameState.status === "finished") {
        const myKey = myId === gameState.hostId ? "host" : "guest";
        const otherKey = myKey === "host" ? "guest" : "host";
        const myScore = gameState.scores[myKey];
        const otherScore = gameState.scores[otherKey];
        const won = myScore > otherScore;
        const tie = myScore === otherScore;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-white/20 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden"
                >
                    {won && <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 animate-pulse" />}

                    <Trophy size={64} className={`mx-auto mb-4 ${won ? "text-yellow-400" : tie ? "text-slate-400" : "text-slate-600"}`} />

                    <h2 className="text-3xl font-bold text-white mb-2">
                        {won ? "Victory!" : tie ? "It's a Tie!" : "Game Over"}
                    </h2>
                    <div className="flex justify-center gap-8 text-white mb-8">
                        <div className="text-center">
                            <p className="text-xs text-white/50">You</p>
                            <p className="text-2xl font-bold text-cyan-400">{myScore} pts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-white/50">{opponentName}</p>
                            <p className="text-2xl font-bold text-pink-400">{otherScore} pts</p>
                        </div>
                    </div>

                    <Button onClick={() => {
                        onClose();
                        // Optional: Reset game or delete doc
                    }} className="w-full bg-white/10 hover:bg-white/20">
                        Close Game
                    </Button>
                </motion.div>
            </div>
        );
    }

    const question = QUESTIONS[gameState.currentQIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg bg-slate-800 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">

                {/* Header Scoreboard */}
                <div className="flex justify-between items-center p-4 bg-slate-900/50">
                    <div className="text-cyan-400 font-bold">You: {gameState.scores[myId === gameState.hostId ? "host" : "guest"]}</div>
                    <div className="text-white/50 text-sm">Q {gameState.currentQIndex + 1}/{QUESTIONS.length}</div>
                    <div className="text-pink-400 font-bold">{opponentName}: {gameState.scores[myId === gameState.hostId ? "guest" : "host"]}</div>
                </div>

                {/* Question */}
                <div className="p-8 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8">{question.q}</h3>

                    <div className="grid grid-cols-1 gap-3">
                        {question.a.map((ans: string) => {
                            const isSelected = selectedAnswer === ans;
                            const isCorrect = ans === question.correct;
                            // Show status only if selected
                            let statusClass = "bg-white/10 hover:bg-white/20 border-white/10";
                            if (selectedAnswer) {
                                if (isSelected) {
                                    statusClass = isCorrect ? "bg-green-500/20 border-green-500 text-green-200" : "bg-red-500/20 border-red-500 text-red-200";
                                } else if (isCorrect && showResult) {
                                    // Reveal correct answer if needed (optional)
                                    statusClass = "bg-green-500/10 border-green-500/50 text-green-200/50";
                                } else {
                                    statusClass = "bg-white/5 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={ans}
                                    onClick={() => handleAnswer(ans)}
                                    disabled={!!selectedAnswer}
                                    className={`w-full p-4 rounded-xl border text-left font-medium transition-all ${statusClass}`}
                                >
                                    {ans}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 text-center text-xs text-white/30">
                    Wait for opponent...
                </div>
            </div>
        </div>
    );
}
