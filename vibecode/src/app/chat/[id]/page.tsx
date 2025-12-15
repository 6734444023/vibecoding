"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
    const { id: otherUserId } = useParams();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [otherUser, setOtherUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
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

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !otherUserId) return;

        const chatId = [user.uid, otherUserId].sort().join("_");
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: newMessage,
            senderId: user.uid,
            createdAt: serverTimestamp(),
        });
        setNewMessage("");
    };

    if (loading || !user) return <div className="h-screen w-full bg-cyan-900 flex items-center justify-center text-white">Loading chat...</div>;

    return (
        <div className="flex flex-col h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/landing-bg.png')" }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border-b border-white/10 text-white shadow-lg">
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

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`
                    max-w-[70%] px-5 py-3 rounded-2xl text-white shadow-md
                    ${isMe
                                            ? "bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-tr-none"
                                            : "bg-white/20 backdrop-blur-md border border-white/10 rounded-tl-none"}
                  `}
                                >
                                    {msg.text}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md border-t border-white/10">
                <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a chill message..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all"
                    />
                    <Button type="submit" className="rounded-full w-12 h-12 flex items-center justify-center p-0 bg-cyan-500 hover:bg-cyan-400">
                        <Send size={20} className="ml-1" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
