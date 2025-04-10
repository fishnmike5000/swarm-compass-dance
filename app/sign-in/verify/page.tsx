/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { EmailLinkErrorCodeStatus, isEmailLinkError } from '@clerk/nextjs/errors'
import { useRouter } from 'next/navigation'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { FiLoader } from 'react-icons/fi'

export default function VerifyEmailLink() {
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'failed' | 'expired' | 'client_mismatch'>('loading')
    const { handleEmailLinkVerification, loaded } = useClerk()
    const router = useRouter()



    useEffect(() => {

        async function verify() {
            try {
                const protocol = window.location.protocol
                const host = window.location.host

                await handleEmailLinkVerification({
                    redirectUrl: `${protocol}//${host}/sign-in`,
                })

                setVerificationStatus('verified')
            } catch (err: any) {
                let status: typeof verificationStatus = 'failed'

                if (isEmailLinkError(err)) {
                    if (err.code === EmailLinkErrorCodeStatus.Expired) {
                        status = 'expired'
                    } else if (err.code === EmailLinkErrorCodeStatus.ClientMismatch) {
                        status = 'client_mismatch'
                    }
                }
                setVerificationStatus(status)
            }
        }

        if (!loaded) return
        verify()
    }, [handleEmailLinkVerification, loaded])

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
            <Card className="p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20 w-full max-w-md text-center">
                <h1 className="text-3xl font-light tracking-tight text-white">Verifying Email</h1>

                {verificationStatus === 'loading' && (
                    <>
                        <FiLoader className="animate-spin text-white text-4xl mx-auto my-4" />
                        <p className="text-white/80">Please wait while we verify your email...</p>
                    </>
                )}

                {verificationStatus === 'verified' && (
                    <>
                        <p className="text-white/80 mt-4">Successfully signed in. You may return to your original tab.</p>
                        <Button
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white w-full"
                            onClick={() => router.push("/dashboard")}
                        >
                            Continue to Dashboard</Button>
                    </>
                )}

                {verificationStatus === 'failed' && (
                    <>
                        <p className="text-red-400 mt-4">The email link verification failed.</p>
                        <Button className="mt-4" onClick={() => router.push('/sign-in')}>Try Again</Button>
                    </>
                )}

                {verificationStatus === 'expired' && (
                    <>
                        <p className="text-red-400 mt-4">The email link has expired.</p>
                        <Button className="mt-4" onClick={() => router.push('/sign-in')}>Resend Email</Button>
                    </>
                )}

                {verificationStatus === 'client_mismatch' && (
                    <>
                        <p className="text-red-400 mt-4">You must complete the sign-in on the same device and browser.</p>
                        <Button className="mt-4" onClick={() => router.push('/sign-in')}>Sign In Again</Button>
                    </>
                )}
            </Card>
        </div>
    )
}