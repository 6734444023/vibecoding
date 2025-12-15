"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import TriviaGame from "@/components/TriviaGame";
import Image from "next/image";
import { ArrowLeft, Send, Smile, Gamepad2, Trophy } from "lucide-react";
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
                // If game is active, show it
                if (data.status === 'active') {
                    setGameActive(true);
                }
                // If finished, keep showing until closed manually or handle otherwise
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
    };

    const sendInvite = async () => {
        if (!user || !otherUserId) return;
        const chatId = [user.uid, otherUserId].sort().join("_");

        // Initialize Game Doc
        const gameRef = doc(db, "chats", chatId, "game", "current");
        await setDoc(gameRef, {
            status: 'waiting',
            hostId: user.uid,
            scores: { host: 0, guest: 0 },
            currentQIndex: 0,
            createdAt: serverTimestamp()
        });

        // Send Invite Message
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: "🎮 I challenge you to a Trivia Battle! Do you accept?",
            senderId: user.uid,
            type: 'invite',
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
        // Local state will update via listener
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
                {gameActive && (
                    <TriviaGame
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
                {/* Global Theme Selector is fixed in top-right, so we don't need a local button here */}
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
                                            <Trophy className="text-yellow-300 w-8 h-8 animate-bounce" />
                                            <span className="font-bold text-lg">TRIVIA CHALLENGE</span>
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
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-16 left-0 z-50"
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
                            onClick={sendInvite}
                            className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white hover:brightness-110 transition-all shadow-lg"
                            title="Challenge to Trivia"
                        >
                            <Gamepad2 size={24} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
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
