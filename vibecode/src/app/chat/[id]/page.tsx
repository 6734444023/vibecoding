"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import TriviaGame from "@/components/TriviaGame";
import TicTacToe from "@/components/games/TicTacToe";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import Image from "next/image";
import { ArrowLeft, Send, Smile, Gamepad2, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";

export default function ChatPage() {
    const { id: otherUserId } = useParams();
    const { user, loading } = useAuth();
    const { currentChatTheme } = useTheme();
    const router = useRouter();
    const [otherUser, setOtherUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [gameActive, setGameActive] = useState(false);
    const [gameStateData, setGameStateData] = useState<any>(null);
    const [showGamePicker, setShowGamePicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    // Fetch Other User
    useEffect(() => {
        if (!otherUserId) return;
        const fetchUser = async () => {
            const docRef = doc(db, "users", otherUserId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setOtherUser(docSnap.data());
            }
        };
        fetchUser();
    }, [otherUserId]);

    // Realtime Messages
    useEffect(() => {
        if (!user || !otherUserId) return;

        const chatId = [user.uid, otherUserId].sort().join("_");
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            // Scroll to bottom
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => unsubscribe();
    }, [user, otherUserId]);

    // Listen for Game Invite/Status
    useEffect(() => {
        if (!user || !otherUserId) return;
        const chatId = [user.uid, otherUserId].sort().join("_");
        const gameRef = doc(db, "chats", chatId, "game", "current");

        const unsub = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setGameStateData(data);
                // If game is active, show it
                if (data.status === 'active') {
                    setGameActive(true);
                }
            } else {
                setGameActive(false);
                setGameStateData(null);
            }
        });
        return () => unsub();
    }, [user, otherUserId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !otherUserId) return;

        const chatId = [user.uid, otherUserId].sort().join("_");
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: newMessage,
            senderId: user.uid,
            type: 'text',
            createdAt: serverTimestamp(),
        });
        setNewMessage("");
        setShowEmoji(false);
        setShowGamePicker(false);
    };

    const sendInvite = async (type: 'trivia' | 'tictactoe' | 'rps') => {
        if (!user || !otherUserId) return;
        const chatId = [user.uid, otherUserId].sort().join("_");
        setShowGamePicker(false);
        setShowEmoji(false);

        // Initialize Game Doc
        const gameRef = doc(db, "chats", chatId, "game", "current");

        let initialData: any = {
            status: 'waiting',
            hostId: user.uid,
            scores: { host: 0, guest: 0 },
            createdAt: serverTimestamp(),
            gameType: type
        };

        let inviteText = "🎮 I challenge you to a Game! Do you accept?";

        if (type === 'trivia') {
            initialData = { ...initialData, currentQIndex: 0 };
            inviteText = "🧠 I challenge you to a Trivia Battle! Do you accept?";
        } else if (type === 'tictactoe') {
            initialData = { ...initialData, board: Array(9).fill(null), turn: user.uid, winner: null };
            inviteText = "❌⭕ I challenge you to Tic-Tac-Toe! Do you accept?";
        } else if (type === 'rps') {
            initialData = { ...initialData, choices: { host: null, guest: null } };
            inviteText = "✊✋✌️ I challenge you to Rock Paper Scissors! Do you accept?";
        }

        await setDoc(gameRef, initialData);

        // Send Invite Message
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: inviteText,
            senderId: user.uid,
            type: 'invite',
            gameType: type,
            createdAt: serverTimestamp(),
        });
    };

    const acceptInvite = async () => {
        if (!user || !otherUserId) return;
        const chatId = [user.uid, otherUserId].sort().join("_");
        const gameRef = doc(db, "chats", chatId, "game", "current");

        await updateDoc(gameRef, {
            status: 'active'
        });
    };

    const onEmojiClick = (emojiObject: any) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    if (loading || !user) return <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white">Loading chat...</div>;

    const chatId = user && otherUserId ? [user.uid, otherUserId].sort().join("_") : "";

    return (
        <div className="flex flex-col h-screen relative overflow-hidden">
            {/* Game Overlay */}
            <AnimatePresence>
                {gameActive && (gameStateData?.gameType === 'trivia' || !gameStateData?.gameType) && (
                    <TriviaGame
                        chatId={chatId}
                        myId={user.uid}
                        opponentId={otherUserId as string}
                        opponentName={otherUser?.displayName || "Opponent"}
                        onClose={() => setGameActive(false)}
                    />
                )}
                {gameActive && gameStateData?.gameType === 'tictactoe' && (
                    <TicTacToe
                        chatId={chatId}
                        myId={user.uid}
                        opponentId={otherUserId as string}
                        opponentName={otherUser?.displayName || "Opponent"}
                        onClose={() => setGameActive(false)}
                    />
                )}
                {gameActive && gameStateData?.gameType === 'rps' && (
                    <RockPaperScissors
                        chatId={chatId}
                        myId={user.uid}
                        opponentId={otherUserId as string}
                        opponentName={otherUser?.displayName || "Opponent"}
                        onClose={() => setGameActive(false)}
                    />
                )}
            </AnimatePresence>

            {/* Chat Theme Background Layer */}
            <div className="absolute inset-0 z-0">
                {currentChatTheme.type === 'video' ? (
                    <video
                        src={currentChatTheme.bg}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                    />
                ) : currentChatTheme.type === 'color' ? (
                    <div className="w-full h-full" style={{ background: currentChatTheme.bg }} />
                ) : (
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${currentChatTheme.bg}')` }}
                    />
                )}
                {/* Overlay for legibility */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/10 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push("/lobby")} className="p-2">
                        <ArrowLeft />
                    </Button>
                    {otherUser ? (
                        <div className="flex items-center gap-3">
                            {otherUser.photoURL ? (
                                <Image src={otherUser.photoURL} alt={otherUser.displayName} width={40} height={40} className="rounded-full border border-white/50" />
                            ) : (
                                <div className="w-10 h-10 bg-cyan-500 rounded-full" />
                            )}
                            <div>
                                <h2 className="font-bold text-lg leading-none">{otherUser.displayName}</h2>
                                <span className="text-xs text-green-300 opacity-80">Online</span>
                            </div>
                        </div>
                    ) : (
                        <div>Loading user...</div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        const isInvite = msg.type === 'invite';

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`
                    max-w-[70%] px-5 py-3 rounded-2xl text-white shadow-md relative break-words
                    ${isMe
                                            ? `${currentChatTheme.bubble.me} rounded-tr-none`
                                            : `${currentChatTheme.bubble.other} rounded-tl-none`}
                    ${isInvite ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-yellow-400/50" : ""}
                  `}
                                >
                                    {isInvite && (
                                        <div className="flex flex-col gap-2 items-center mb-2">
                                            {msg.gameType === 'tictactoe' ? (
                                                <div className="text-4xl">❌⭕</div>
                                            ) : msg.gameType === 'rps' ? (
                                                <div className="text-4xl mb-1">✊✋✌️</div>
                                            ) : (
                                                <Trophy className="text-yellow-300 w-8 h-8 animate-bounce" />
                                            )}

                                            <span className="font-bold text-lg text-center leading-tight">
                                                {msg.gameType === 'tictactoe' ? "TIC-TAC-TOE" :
                                                    msg.gameType === 'rps' ? "ROCK PAPER SCISSORS" :
                                                        "TRIVIA CHALLENGE"}
                                            </span>
                                        </div>
                                    )}
                                    {msg.text}
                                    {isInvite && !isMe && (
                                        <Button
                                            onClick={acceptInvite}
                                            className="mt-3 w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold"
                                        >
                                            Accept Challenge
                                        </Button>
                                    )}
                                    {isInvite && isMe && (
                                        <div className="mt-2 text-xs opacity-70 italic text-center">Waiting for opponent...</div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md border-t border-white/10">
                <div className="max-w-4xl mx-auto relative">
                    {/* Game Picker Popover */}
                    <AnimatePresence>
                        {showGamePicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-full mb-4 left-0 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl w-64"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-white">Choose Game</h3>
                                    <button onClick={() => setShowGamePicker(false)} className="text-white/50 hover:text-white"><X size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    <button onClick={() => sendInvite('trivia')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 text-white transition-all">
                                        <span className="text-xl">🧠</span>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Trivia</div>
                                            <div className="text-[10px] opacity-70">Battle of wits</div>
                                        </div>
                                    </button>

                                    <button onClick={() => sendInvite('tictactoe')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-white transition-all">
                                        <span className="text-xl">❌</span>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Tic-Tac-Toe</div>
                                            <div className="text-[10px] opacity-70">Classic strategy</div>
                                        </div>
                                    </button>

                                    <button onClick={() => sendInvite('rps')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/50 text-white transition-all">
                                        <span className="text-xl">✌️</span>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Rock Paper Scissors</div>
                                            <div className="text-[10px] opacity-70">Luck & Mindgames</div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Emoji Picker Popover */}
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-full mb-4 left-0 z-50"
                            >
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={Theme.DARK}
                                    searchDisabled
                                    width={300}
                                    height={400}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={sendMessage} className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => { setShowGamePicker(!showGamePicker); setShowEmoji(false); }}
                            className={`p-3 rounded-full text-white transition-all shadow-lg ${showGamePicker ? 'bg-orange-500 scale-110 shadow-orange-500/50' : 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:brightness-110'}`}
                            title="Play Game"
                        >
                            <Gamepad2 size={24} />
                        </button>

                        <button
                            type="button"
                            onClick={() => { setShowEmoji(!showEmoji); setShowGamePicker(false); }}
                            className={`p-3 rounded-full text-white transition-all ${showEmoji ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            <Smile size={24} />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a chill message..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                        />
                        <Button type="submit" className="rounded-full w-12 h-12 flex items-center justify-center p-0 bg-purple-500 hover:bg-purple-400">
                            <Send size={20} className="ml-1" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
