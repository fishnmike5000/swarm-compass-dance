/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { FiLoader } from "react-icons/fi"; // Spinner icon
import { useToast } from "../components/ui/use-toast"; // Toast notifications

const SignUp = () => {
    const router = useRouter();
    const { signUp, isLoaded } = useSignUp();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isLoaded) return null;

    const { startEmailLinkFlow } = signUp.createEmailLinkFlow();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);

        try {
            await signUp.create({
                emailAddress: email,
                unsafeMetadata: { businessName, fullName },
            });
            setSubmitted(true);
            toast({
                title: "Check your inbox!",
                description: "A sign-up link has been sent to your email.",
            });
            await startEmailLinkFlow({
                redirectUrl: `${window.location.origin}/sign-up/verify`,
            });
        } catch (err: any) {
            setVerifying(false);
            toast({
                title: "Sign-up failed",
                description: err.errors?.[0]?.longMessage || "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light tracking-tight text-white">
                            <span className="font-normal">AI Readiness</span> Audit
                        </h1>
                        <p className="text-white/80 mt-2">Create your account to continue</p>
                    </div>

                    {submitted ? (
                        <div className="text-center text-white">
                            <p>Check your email and click the link to continue.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    required
                                    placeholder="Your Full Name"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={verifying}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="text-white">Business Name</Label>
                                <Input
                                    id="businessName"
                                    type="text"
                                    required
                                    placeholder="Your Business Name"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    disabled={verifying}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Work Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={verifying}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex justify-center items-center"
                                disabled={verifying}
                            >
                                {verifying ? (
                                    <FiLoader className="animate-spin" />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            className="text-white/70 hover:text-white text-sm"
                            onClick={() => router.push("/")}
                            disabled={verifying}
                        >
                            Return to home
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SignUp;
