"use client";
import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { motion } from 'framer-motion';

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

interface VideoCallProps {
    chatId: string;
    userId: string;
    isCaller: boolean;
    onEndCall: () => void;
}

export default function VideoCall({ chatId, userId, isCaller, onEndCall }: VideoCallProps) {
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [status, setStatus] = useState("Initializing...");
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let peerConnection: RTCPeerConnection = new RTCPeerConnection(servers);
        let localTracks: MediaStreamTrack[] = [];

        const startCall = async () => {
            // 1. Get User Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localTracks = stream.getTracks();

                localTracks.forEach((track) => {
                    peerConnection.addTrack(track, stream);
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
                setStatus("Error: Cannot access camera/mic");
                return;
            }

            // 2. Setup Remote Stream
            const remote = new MediaStream();
            setRemoteStream(remote);
            peerConnection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remote.addTrack(track);
                });
            };
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;


            // 3. Signaling logic
            const callDocRef = doc(db, "chats", chatId, "call", "active");
            const offerCandidates = collection(callDocRef, "offerCandidates");
            const answerCandidates = collection(callDocRef, "answerCandidates");

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    addDoc(isCaller ? offerCandidates : answerCandidates, event.candidate.toJSON());
                }
            };

            if (isCaller) {
                setStatus("Calling...");
                // Create Offer
                const offerDescription = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offerDescription);

                const offer = {
                    sdp: offerDescription.sdp,
                    type: offerDescription.type,
                };

                await setDoc(callDocRef, { offer, callerId: userId });

                // Listen for Answer
                onSnapshot(callDocRef, (snapshot) => {
                    const data = snapshot.data();
                    if (!peerConnection.currentRemoteDescription && data?.answer) {
                        const answerDescription = new RTCSessionDescription(data.answer);
                        peerConnection.setRemoteDescription(answerDescription);
                        setStatus("Connected");
                    }
                });

                // Listen for Answer Candidates
                onSnapshot(answerCandidates, (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            const candidate = new RTCIceCandidate(change.doc.data());
                            peerConnection.addIceCandidate(candidate);
                        }
                    });
                });

            } else {
                setStatus("Incoming Call...");
                // We are Callee
                // Listen for Offer
                const docSnap = await getDoc(callDocRef);
                const data = docSnap.data();

                if (data?.offer) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

                    const answerDescription = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answerDescription);

                    const answer = {
                        type: answerDescription.type,
                        sdp: answerDescription.sdp,
                    };

                    await updateDoc(callDocRef, { answer });
                    setStatus("Connected");

                    // Listen for Offer Candidates
                    onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                peerConnection.addIceCandidate(candidate);
                            }
                        });
                    });
                }
            }
            setPc(peerConnection);
        };

        startCall();

        return () => {
            localTracks.forEach(t => t.stop());
            peerConnection.close();
        };
    }, [chatId, isCaller]);


    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = !micEnabled);
            setMicEnabled(!micEnabled);
        }
    };

    const toggleCam = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => t.enabled = !camEnabled);
            setCamEnabled(!camEnabled);
        }
    };

    const hangup = async () => {
        onEndCall();
        // Also clean up DB if needed, usually just leaving the room is enough for MVP
        // Ideally delete the 'active' doc or set status to ended
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4"
        >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Remote Video (Main) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Local Video (PiP) */}
                <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
                    className="absolute top-4 right-4 w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-white/20 cursor-move"
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror-x"
                    />
                    {!camEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white/50">
                            <VideoOff size={24} />
                        </div>
                    )}
                </motion.div>

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    {status}
                </div>

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {micEnabled ? <Mic /> : <MicOff />}
                    </button>

                    <button
                        onClick={hangup}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg scale-110"
                    >
                        <PhoneOff size={32} />
                    </button>

                    <button
                        onClick={toggleCam}
                        className={`p-4 rounded-full transition-all ${camEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {camEnabled ? <Video /> : <VideoOff />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
