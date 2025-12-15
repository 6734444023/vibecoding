"use client";
import React, { useState } from "react";
import Button from "./ui/Button";
import { X, Circle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const winner = calculateWinner(board);

    const handleClick = (index: number) => {
        if (board[index] || winner) return;
        const newBoard = [...board];
        newBoard[index] = isXNext ? "X" : "O";
        setBoard(newBoard);
        setIsXNext(!isXNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4">Chill Tac Toe</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {board.map((cell, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClick(index)}
                        className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-inner hover:bg-white/30 transition-colors"
                    >
                        {cell === "X" && <X className="text-cyan-300" />}
                        {cell === "O" && <Circle className="text-yellow-300" />}
                    </motion.button>
                ))}
            </div>
            <div className="text-white mb-4 h-6">
                {winner ? (
                    <span className="text-green-300 font-bold">Winner: {winner}</span>
                ) : (
                    <span className="text-white/70">Next Player: {isXNext ? "X" : "O"}</span>
                )}
            </div>
            <Button variant="ghost" onClick={resetGame} className="text-sm">
                <RefreshCw size={16} /> Reset
            </Button>
        </div>
    );
};

function calculateWinner(squares: any[]) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

export default TicTacToe;
