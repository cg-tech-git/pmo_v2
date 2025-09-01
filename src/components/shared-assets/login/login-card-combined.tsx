"use client";

import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { ProjectLogo } from "@/components/foundations/logo/project-logo";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const LoginCardCombinedInner = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await signIn("google", { callbackUrl });
        } catch (error) {
            setError("An error occurred during sign in. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-primary px-4 py-12 sm:bg-secondary md:px-8 md:pt-24">
            <div className="flex w-full flex-col gap-6 bg-primary sm:mx-auto sm:max-w-110 sm:rounded-2xl sm:px-10 sm:py-8 sm:shadow-sm">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <ProjectLogo className="h-12 w-auto max-md:hidden" />
                        <ProjectLogo className="h-10 w-auto md:hidden" />
                        {/* Fallback text logo if image doesn't load */}
                        <div className="text-2xl font-bold text-primary mt-2" style={{display: 'none'}} id="logo-fallback">
                            ALLAITH
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-display-xs font-semibold text-primary">Welcome to PMO</h1>
                        <p className="text-md text-tertiary">Sign in with your company Google account</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {error && (
                        <div className="rounded-lg bg-error-secondary border border-error-secondary-solid p-4">
                            <p className="text-sm text-error-primary">{error}</p>
                            <p className="text-xs text-error-secondary mt-1">
                                Only @allaith.com, @cg-tech.co, and @thevirtulab.com email addresses are allowed.
                            </p>
                        </div>
                    )}

                    <SocialButton 
                        social="google" 
                        theme="color" 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Signing in..." : "Sign in with Google"}
                    </SocialButton>

                    <div className="text-center">
                        <p className="text-xs text-tertiary">
                            By signing in, you agree to use this application for authorized business purposes only.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const LoginCardCombined = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginCardCombinedInner />
        </Suspense>
    );
};
