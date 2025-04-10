/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from 'react';
import Tesseract from "tesseract.js";
import { Mic, Upload, LogOut } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { createClient } from "@supabase/supabase-js";
import { useClerk, useSignIn, useUser } from '@clerk/nextjs';
import { FiLoader } from 'react-icons/fi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../components/ui/dialog';
const supabase = createClient(
    "https://gpfkvgnyhlysuwmexcju.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZmt2Z255aGx5c3V3bWV4Y2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDAxOTAsImV4cCI6MjA1NzI3NjE5MH0.0BcgrHQG0TB4WyMw28Ctmbv117FowdNMN3wE6kqhH4o"
);


const Dashboard = () => {
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState<{ id: string; email: string; research: string, files_content: string[] } | null>(null);
    const pcRef = useRef<RTCPeerConnection>(null); // Store PeerConnection
    const streamRef = useRef<MediaStream>(null); // Store MediaStream
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isUploading, setisUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ from: string; text: string }[]>(
        []
    );
    function handleServerEvent(e: MessageEvent) {
        try {
            const event = JSON.parse(e.data);

            // Switch based on the type of event received
            switch (event.type) {
                case 'conversation.item.input_audio_transcription.completed': {
                    const finalText = event.transcript || '';
                    setMessages(prev => {
                        if (prev[prev.length - 1]?.from === 'user') {
                            const newArr = [...prev];
                            newArr[newArr.length - 1] = { from: 'user', text: finalText };
                            return newArr;
                        } else {
                            return [...prev, { from: 'user', text: finalText }];
                        }
                    });
                    break;
                }
                case 'response.done': {

                    const fullText =
                        event.response.output[0]?.content[0]?.transcript || '';
                    setMessages(prev => {
                        if (prev[prev.length - 1]?.from === 'assistant') {
                            const newArr = [...prev];
                            newArr[newArr.length - 1] = { from: 'assistant', text: fullText };
                            return newArr;
                        } else {
                            return [...prev, { from: 'assistant', text: fullText }];
                        }
                    });
                    break;
                }
            }
        } catch (err) {
        }
    }
    async function startConnection() {
        if (isConnected) return; // Prevent duplicate connections
        toast({
            title: "Establishing connection",
            description: "Your voice agent is being initialised, please wait...",

        });
        const tokenResponse = await fetch(
            "https://fishnmike5000.app.n8n.cloud/webhook/e41fd4de-290e-4d8a-92de-2b0e452da65f",
            { method: "POST", body: JSON.stringify({ email: user?.emailAddresses[0].emailAddress }), headers: { "Content-Type": "application/json" } }
        );
        const data = await tokenResponse.json();
        const EPHEMERAL_KEY = data.EPHEMERAL_KEY;

        // Create WebRTC connection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // Setup remote audio
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);
        document.body.appendChild(audioEl); // Ensure it's in the DOM

        // Get local microphone audio
        const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = ms;
        ms.getTracks().forEach((track) => pc.addTrack(track, ms));

        // Setup data channel
        const dc = pc.createDataChannel("oai-events");
        dc.onopen = () => {
            setIsConnected(true);
            toast({
                title: "Connection established!",
                description: "Your voice agent is now active...",
            });
            dc.send(
                JSON.stringify({
                    type: "response.create",
                    response: {
                        instructions: "Begin Conversation with the greeting specified in the instruction and move on to other things as intelligently deduced from the context and instuctions given."
                    },
                })
            );
        };
        dc.onerror = (e) => { }
        dc.onmessage = (e) => {
            handleServerEvent(e);
        };

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${EPHEMERAL_KEY}`,
                "Content-Type": "application/sdp",
            },
        });
        await pc.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });

        // Monitor connection state
        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "disconnected") {

                stopConnection();
            };;
        };
    }

    async function stopConnection() {
        // Don't send short conversations
        if (messages.length > 5) {
            await supabase.from("transcripts").insert({
                conversation: JSON.stringify(messages),
                organisation: organisation?.id
            })
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsConnected(false);
        toast({
            title: "Connection Ended!",
            description: messages.length > 5 ? "Your conversation has been sent to our AI for processing. We will get back to you in no time." : "Your conversation was not sent to be processed as it was too short!",
        });
    }
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setisUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];
            const { data: { text } } = await Tesseract.recognize(file, "eng", {
            });
            const filePath = `${user!.id}/${Date.now()}-${file.name}`;

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage.from("default").upload(filePath, file);
            if (error) {
                toast({
                    title: "Upload failed",
                    description: error.message,
                });
                return;
            }

            // Get the public URL of the uploaded file
            const { data: urlData } = supabase.storage.from("default").getPublicUrl(filePath);
            const fileUrl = urlData.publicUrl;

            // Fetch existing files array
            const { data: orgData, error: fetchError } = await supabase
                .from("organisations")
                .select("files, files_content")
                .eq("email", user?.primaryEmailAddress?.emailAddress)
                .single();

            if (fetchError) {
                toast({
                    title: "Fetch failed",
                    description: fetchError.message,
                });
                return;
            }

            const existingFiles: string[] = orgData?.files || [];
            const existingFilesContent: string[] = orgData?.files_content || [];
            // Update the row with the new file URL
            const { error: updateError } = await supabase
                .from("organisations")
                .update({ files: [...existingFiles, fileUrl], files_content: [...existingFilesContent, text] }) // Append new file URL
                .eq("email", user?.primaryEmailAddress?.emailAddress);

            if (updateError) {
                toast({
                    title: "Update failed",
                    description: updateError.message,
                });
                return;
            }
            setisUploading(false);
            setOrganisation({ ...organisation!, files_content: [...organisation!.files_content, text] });
            toast({
                title: "File uploaded",
                description: `${file.name} has been uploaded successfully.`,
            });
        } catch (e) {
            toast({
                title: "Something went wrong...",
            });
        }
    };


    useEffect(() => {
        async function fetchOrganisation() {
            const { data, error } = await supabase
                .from("organisations")
                .select("*")
                .eq("email", user?.primaryEmailAddress?.emailAddress)
                .single(); // Fetches only one record

            if (error) {
                toast({
                    description: `Error fetching organisation details, please refresh!`,
                });
            } else {
                setOrganisation(data);
            }
        }
        if (user && !organisation) {
            fetchOrganisation();
        }
    }, [user, toast, organisation])

    const fullName = user?.unsafeMetadata.fullName as string;
    return (
        <div className="min-h-screen bg-[#F1F0FB] flex flex-col">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out?
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => signOut()}>
                            Sign Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-[#1A1F2C]">AI Readiness Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-[#8E9196]" onClick={() => setOpen(true)}>
                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-[#9b87f5] flex items-center justify-center text-white">
                            {/* User initials or avatar would go here */}
                            {user?.primaryEmailAddress?.emailAddress[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Introduction Message */}
                    {/* <Card className="mb-8 shadow-sm border-0">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-medium text-[#1A1F2C] mb-3">Welcome to your AI Readiness Dashboard</h2>
                            <p className="text-[#4A5568] leading-relaxed">
                                What's up {fullName?.split(" ")[0]}. Excited to have you try this out, figure you can use the voice agent while sitting in the 5.
                                You don't need to, but you can also throw in some documents to the upload document button.
                                The voice agent can reference any documents and we'll use those to create the AI readiness score and help create the best market opportunities.
                                We're going to look for the easiest AI functions you can deploy with the highest ROI.
                                By the way, when I say "we" I'm talking about me, a series of automated agents (Claude, GPT-4.5, Gemini), and a handful of developers more nerdy than me.
                                Cheers, Mike
                            </p>
                        </CardContent>
                    </Card> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Voice Agent Card */}
                        <Card className="shadow-sm border-0">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isConnected ? 'bg-[#9b87f5] animate-pulse-subtle' : 'bg-[#F1F0FB] border-2 border-[#9b87f5]'}`}>
                                        <Mic className={`h-8 w-8 ${isConnected ? 'text-white' : 'text-[#9b87f5]'}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-medium text-[#1A1F2C] mb-2">Voice Agent</h2>
                                        <p className="text-[#8E9196] mb-4">Start your voice agent to begin the AI readiness assessment.</p>
                                        <Button
                                            onClick={() => {
                                                if (organisation) {
                                                    if (isConnected) {
                                                        stopConnection()
                                                    } else {
                                                        startConnection()
                                                    }
                                                }
                                            }}
                                            disabled={!organisation}
                                            className={`w-full ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-[#9b87f5] hover:bg-[#8a76e4]'}`}
                                        >
                                            {(organisation) ? (isConnected ? 'Stop Voice Agent' : 'Start Voice Agent') : <FiLoader className="animate-spin mr-2" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Upload Card */}
                        <Card className="shadow-sm border-0">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-[#F1F0FB] border-2 border-[#1EAEDB] flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-[#1EAEDB]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-medium text-[#1A1F2C] mb-2">Upload Documents</h2>
                                        <p className="text-[#8E9196] mb-4">Upload your company documents for AI readiness analysis.</p>
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                accept=".png, .jpg, .jpeg, .bmp, .pbm"
                                            />
                                            <div className="w-full flex items-center justify-center  h-10 px-4 bg-[#1EAEDB] hover:bg-[#0FA0CE] text-white rounded-md text-center cursor-pointer">
                                                {!isUploading ? "Upload Files" : <FiLoader className="animate-spin mr-2" />}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
