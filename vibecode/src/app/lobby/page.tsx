"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TicTacToe from "@/components/TicTacToe";
import MemoryMatch from "@/components/MemoryMatch"; // Import MemoryMatch
import RockPaperScissors from "@/components/RockPaperScissors"; // Import RPS
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, UserPlus, Gamepad2, LogOut, Grid3X3, Brain, Scissors } from "lucide-react";

export default function LobbyPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [activeGame, setActiveGame] = useState<string | null>(null); // Track active game

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users"), where("uid", "!=", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || !user) return <div className="h-screen flex items-center justify-center text-white">Loading vibes...</div>;

    return (
        <div className="min-h-screen w-full relative overflow-y-auto">
            <div className="relative z-10 max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 bg-white/20 backdrop-blur-lg p-4 rounded-full shadow-lg border border-white/30">
                    <div className="flex items-center gap-4">
                        {user.photoURL && (
                            <Image
                                src={user.photoURL}
                                alt="Me"
                                width={50}
                                height={50}
                                className="rounded-full border-2 border-white shadow-md"
                            />
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-white">Welcome, {user.displayName}</h1>
                            <p className="text-white/70 text-sm">Stay chill.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={logout} className="text-red-200 hover:text-red-100 hover:bg-red-500/20">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area: Users / Friends */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl min-h-[500px]">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <UserPlus className="text-cyan-300" /> People Vibing Now
                            </h2>

                            {users.length === 0 ? (
                                <div className="text-white/50 text-center py-20">
                                    No one else is here yet. Invite some friends!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {users.map((otherUser) => (
                                        <motion.div
                                            key={otherUser.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group"
                                        >
                                            {otherUser.photoURL ? (
                                                <Image src={otherUser.photoURL} alt={otherUser.displayName} width={50} height={50} className="rounded-full" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white group-hover:text-cyan-200 transition-colors">{otherUser.displayName}</h3>
                                                <p className="text-xs text-white/60">Vibing lately...</p>
                                            </div>
                                            <Link href={`/chat/${otherUser.uid}`}>
                                                <Button className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400">
                                                    <MessageCircle size={18} />
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Mini Game & Info */}
                    <div className="flex flex-col gap-6">
                        <motion.div
                            layout
                            className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-2 text-white font-bold mb-2">
                                <Gamepad2 className="text-cyan-300" /> Mini Games
                            </div>

                            {!activeGame ? (
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setActiveGame("tictactoe")}
                                        className="justify-start gap-4 h-16 text-lg"
                                    >
                                        <Grid3X3 className="text-cyan-300" /> Chill Tac Toe
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setActiveGame("memory")}
                                        className="justify-start gap-4 h-16 text-lg"
                                    >
                                        <Brain className="text-pink-300" /> Zen Memory
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setActiveGame("rps")}
                                        className="justify-start gap-4 h-16 text-lg"
                                    >
                                        <Scissors className="text-yellow-300" /> Rock Paper Scissors
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Button variant="ghost" onClick={() => setActiveGame(null)} className="self-start text-sm -ml-2 mb-2">
                                        ← Back to Games
                                    </Button>

                                    {activeGame === "tictactoe" && <TicTacToe />}
                                    {activeGame === "memory" && <MemoryMatch />}
                                    {activeGame === "rps" && <RockPaperScissors />}
                                </div>
                            )}
                        </motion.div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl text-white">
                            <h3 className="font-bold mb-2">Did you know?</h3>
                            <p className="text-sm opacity-80">Listening to ocean sounds can reduce stress levels by 30%. Relax and enjoy.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
