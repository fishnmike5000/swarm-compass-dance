/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useClerk } from '@clerk/nextjs';
import { EmailLinkErrorCodeStatus, isEmailLinkError } from '@clerk/nextjs/errors';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';

export default function VerifyEmailLink() {
    const [verificationStatus, setVerificationStatus] = React.useState('loading');
    const { handleEmailLinkVerification, loaded } = useClerk();
    const router = useRouter();


    React.useEffect(() => {
        async function verify() {
            try {
                const protocol = window.location.protocol;
                const host = window.location.host;

                await handleEmailLinkVerification({
                    redirectUrl: `${protocol}//${host}/sign-up`,
                });
                setVerificationStatus('verified');
            } catch (err: any) {
                let status = 'failed';
                if (isEmailLinkError(err)) {
                    if (err.code === EmailLinkErrorCodeStatus.Expired) {
                        status = 'expired';
                    } else if (err.code === EmailLinkErrorCodeStatus.ClientMismatch) {
                        status = 'client_mismatch';
                    }
                }
                setVerificationStatus(status);
            }
        }

        if (!loaded) return;
        verify();
    }, [handleEmailLinkVerification, loaded]);

    const renderContent = () => {
        if (verificationStatus === 'loading') {
            return <FiLoader className='animate-spin text-white mx-auto' size={24} />;
        }

        const title = 'Verify your email';
        let message = 'Successfully signed up. Return to the original tab to continue.';
        let action = <Button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white w-full"
            onClick={() => router.push("/dashboard")}
        >
            Continue to Dashboard</Button>;

        if (verificationStatus === 'failed') {
            message = 'The email link verification failed.';
            action = <Button onClick={() => router.push('/sign-up')}>Sign Up</Button>;
        } else if (verificationStatus === 'expired') {
            message = 'The email link has expired.';
            action = <Button onClick={() => router.push('/sign-up')}>Sign Up</Button>;
        } else if (verificationStatus === 'client_mismatch') {
            message = 'You must complete the email link sign-up on the same device and browser.';
            action = <Button onClick={() => router.push('/sign-up')}>Sign Up</Button>;
        }

        return (
            <>
                <h1 className='text-2xl font-semibold text-white text-center'>{title}</h1>
                <p className='text-white/80 text-center'>{message}</p>
                {action && <div className='mt-4 flex justify-center'>{action}</div>}
            </>
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <Card className='p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20'>
                    {renderContent()}
                </Card>
            </div>
        </div>
    );
}
