"use client";

import { UserMenu } from "@/components/application/app-navigation/user-menu";
import { cx } from "@/utils/cx";

interface AppHeaderProps {
    showToast?: boolean;
    toastMessage?: string;
    toastType?: 'success' | 'error' | 'info';
}

export const AppHeader = ({ showToast, toastMessage, toastType }: AppHeaderProps) => {
    return (
        <>
            <header className="border-b border-secondary bg-primary sticky top-0 z-50">
                <div className="flex h-16 items-center justify-between px-16">
                    <div className="flex items-center gap-6">
                        <h1 className="text-lg text-primary">
                            <span className="font-semibold">Al Laith:</span> Site Accreditation
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {showToast && (
                            <div className={cx(
                                "rounded-lg px-3 py-2 shadow-sm",
                                "transition-all duration-300 ease-out",
                                toastType === 'success' && "bg-success-secondary",
                                toastType === 'error' && "bg-error-secondary",
                                toastType === 'info' && "bg-brand-secondary"
                            )}>
                                <p className={cx(
                                    "text-sm font-medium",
                                    toastType === 'success' && "text-success-primary",
                                    toastType === 'error' && "text-error-primary",
                                    toastType === 'info' && "text-brand-primary"
                                )}>
                                    {toastMessage}
                                </p>
                            </div>
                        )}
                        <UserMenu />
                    </div>
                </div>
            </header>
        </>
    );
};
