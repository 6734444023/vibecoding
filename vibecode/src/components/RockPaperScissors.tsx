"use client";
import React, { useState } from "react";
import Button from "./ui/Button";
import { Hand, Scissors, Square, RefreshCw } from "lucide-react"; // Square as Paper
import { motion } from "framer-motion";

const CHOICES = [
    { name: "Rock", icon: <Square className="rotate-45" size={32} />, beats: "Scissors" },
    { name: "Paper", icon: <Hand size={32} />, beats: "Rock" },
    { name: "Scissors", icon: <Scissors size={32} />, beats: "Paper" },
];

const RockPaperScissors = () => {
    const [playerChoice, setPlayerChoice] = useState<string | null>(null);
    const [computerChoice, setComputerChoice] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const playGame = (choiceName: string) => {
        const computerRandom = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        setPlayerChoice(choiceName);
        setComputerChoice(computerRandom.name);

        if (choiceName === computerRandom.name) {
            setResult("It's a Tie! 🤝");
        } else {
            const choice = CHOICES.find((c) => c.name === choiceName);
            if (choice?.beats === computerRandom.name) {
                setResult("You Win! 🎉");
            } else {
                setResult("Computer Wins! 🤖");
            }
        }
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
    };

    return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Rock Paper Scissors</h3>

            {!playerChoice ? (
                <div className="flex gap-4">
                    {CHOICES.map((choice) => (
                        <motion.button
                            key={choice.name}
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => playGame(choice.name)}
                            className="p-4 bg-white/10 rounded-xl border border-white/20 text-white flex flex-col items-center gap-2 transition-colors"
                        >
                            {choice.icon}
                            <span className="text-sm font-medium">{choice.name}</span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center w-full">
                    <div className="flex justify-between w-full px-4 mb-6">
                        <div className="flex flex-col items-center text-white">
                            <span className="text-sm opacity-70 mb-2">You</span>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="p-4 bg-cyan-500/20 rounded-full border border-cyan-400"
                            >
                                {CHOICES.find(c => c.name === playerChoice)?.icon}
                            </motion.div>
                        </div>

                        <div className="flex items-center justify-center font-bold text-2xl text-white">
                            VS
                        </div>

                        <div className="flex flex-col items-center text-white">
                            <span className="text-sm opacity-70 mb-2">Computer</span>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="p-4 bg-red-500/20 rounded-full border border-red-400"
                            >
                                {CHOICES.find(c => c.name === computerChoice)?.icon}
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-white mb-6 text-center"
                    >
                        {result}
                    </motion.div>

                    <Button variant="ghost" onClick={resetGame}>
                        <RefreshCw size={16} /> Play Again
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RockPaperScissors;
