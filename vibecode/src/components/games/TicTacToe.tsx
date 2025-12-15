"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import Button from "../ui/Button";
import { motion } from "framer-motion";
import { X, Circle, RotateCcw } from "lucide-react";

interface TicTacToeProps {
    chatId: string;
    myId: string;
    opponentId: string;
    opponentName: string;
    onClose: () => void;
}

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe({ chatId, myId, opponentId, opponentName, onClose }: TicTacToeProps) {
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

    const handleMove = async (index: number) => {
        if (!gameState || gameState.winner || gameState.board[index]) return;

        const isHost = myId === gameState.hostId;
        const isMyTurn = gameState.turn === myId;

        if (!isMyTurn) return;

        const newBoard = [...gameState.board];
        newBoard[index] = isHost ? "X" : "O";

        // Check Winner
        let winner = null;
        for (let combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
                winner = newBoard[a] === "X" ? gameState.hostId : opponentId;
            }
        }

        // Check Draw
        const isDraw = !winner && newBoard.every((cell) => cell !== null);

        let updates: any = {
            board: newBoard,
            turn: isMyTurn ? opponentId : myId // Switch turn
        };

        if (winner) {
            updates.winner = winner;
            const winnerKey = winner === gameState.hostId ? "host" : "guest";
            updates[`scores.${winnerKey}`] = (gameState.scores[winnerKey] || 0) + 1;
        } else if (isDraw) {
            updates.winner = "draw";
        }

        const gameRef = doc(db, "chats", chatId, "game", "current");
        await updateDoc(gameRef, updates);
    };

    const resetGame = async () => {
        const gameRef = doc(db, "chats", chatId, "game", "current");
        await updateDoc(gameRef, {
            board: Array(9).fill(null),
            winner: null,
            turn: gameState.hostId // Host starts new game usually, or alternate? Let's keep simpler: host.
        });
    };

    if (!gameState) return <div className="text-white p-4">Loading Tic-Tac-Toe...</div>;

    const isHost = myId === gameState.hostId;
    const mySymbol = isHost ? "X" : "O";
    const isMyTurn = gameState.turn === myId;
    const winnerName = gameState.winner === myId ? "You" : gameState.winner === "draw" ? "No one" : opponentName;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-slate-800 rounded-3xl border border-white/10 p-6 relative shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-center text-white mb-2">Tic-Tac-Toe</h2>
                <div className="flex justify-between text-sm text-white/70 mb-6 px-4">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-cyan-400">You ({mySymbol})</span>
                        <span>{gameState.scores[isHost ? "host" : "guest"]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-pink-400">{opponentName} ({isHost ? "O" : "X"})</span>
                        <span>{gameState.scores[isHost ? "guest" : "host"]}</span>
                    </div>
                </div>

                {/* Game Board */}
                <div className="aspect-square grid grid-cols-3 gap-2 bg-slate-700 p-2 rounded-xl mb-6">
                    {gameState.board.map((cell: string | null, i: number) => (
                        <button
                            key={i}
                            onClick={() => handleMove(i)}
                            disabled={!!cell || !!gameState.winner || !isMyTurn}
                            className={`
                                rounded-lg flex items-center justify-center text-4xl font-black transition-all
                                ${cell ? "bg-slate-900" : "bg-slate-600 hover:bg-slate-500"}
                                ${cell === "X" ? "text-cyan-400" : "text-pink-400"}
                                ${!cell && isMyTurn && !gameState.winner ? "cursor-pointer ring-2 ring-white/20" : ""}
                            `}
                        >
                            {cell === "X" && <X size={40} strokeWidth={4} />}
                            {cell === "O" && <Circle size={36} strokeWidth={4} />}
                        </button>
                    ))}
                </div>

                {/* Status / Controls */}
                <div className="text-center h-16">
                    {gameState.winner ? (
                        <div className="animate-bounce">
                            <p className="text-xl font-bold text-yellow-400 mb-2">
                                {gameState.winner === "draw" ? "It's a Draw!" : `${winnerName} Won!`}
                            </p>
                            <Button onClick={resetGame} className="bg-white/10 hover:bg-white/20 gap-2">
                                <RotateCcw size={16} /> Play Again
                            </Button>
                        </div>
                    ) : (
                        <p className={`text-lg font-bold ${isMyTurn ? "text-green-400" : "text-white/50"}`}>
                            {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
