/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { FiLoader } from "react-icons/fi"; // Spinner icon
import { useToast } from "../components/ui/use-toast"; // Toast notifications

const SignIn = () => {
    const router = useRouter();
    const { signIn, isLoaded } = useSignIn();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    if (!isLoaded) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { supportedFirstFactors } = await signIn.create({
                identifier: email,
            });

            const emailLinkFactor = supportedFirstFactors?.find(
                (factor) => factor.strategy === "email_link"
            );

            if (!emailLinkFactor) {
                throw new Error("Email link authentication is not available.");
            }

            setEmailSent(true);
            toast({
                title: "Check Your Email!",
                description: `A verification link has been sent to ${email}.`,
            });
            const { emailAddressId } = emailLinkFactor;
            await signIn.createEmailLinkFlow().startEmailLinkFlow({
                emailAddressId,
                redirectUrl: `${window.location.origin}/sign-in/verify`,
            });
        } catch (error: any) {
            toast({
                description: error.errors?.[0]?.message || "Something went wrong!",
            });
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-slate-900">
                <Card className="p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20 text-center max-w-md">
                    <h1 className="text-2xl font-light text-white">Check Your Email</h1>
                    <p className="text-white/80 mt-2">
                        We've sent a sign-in link to <strong>{email}</strong>. Open your inbox and
                        follow the instructions to sign in.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-slate-900">
            <div className="w-full max-w-md blur-in">
                <Card className="p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light tracking-tight text-white">
                            <span className="font-normal">AI Readiness</span> Audit
                        </h1>
                        <p className="text-white/80 mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                                Work Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex justify-center items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                "Send Verification Mail"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            className="text-white/70 hover:text-white text-sm"
                            onClick={() => router.push("/")}
                            disabled={loading}
                        >
                            Return to home
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-white/70 text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={() => router.push("/sign-up")}
                                className="text-blue-400 hover:underline"
                                disabled={loading}
                            >
                                Create one
                            </button>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SignIn;
