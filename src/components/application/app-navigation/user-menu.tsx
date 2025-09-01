"use client";

import { Avatar } from "@/components/base/avatar/avatar";
import { signOut, useSession } from "next-auth/react";
import { LogOut01, User01 } from "@/utils/icons";
import { Button as AriaButton, DialogTrigger, Popover } from "react-aria-components";
import { cx } from "@/utils/cx";

export const UserMenu = () => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
        );
    }

    if (!session?.user) {
        return null;
    }

    const userInitials = session.user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <DialogTrigger>
            <AriaButton className="p-0 hover:opacity-80 transition-opacity duration-150 bg-transparent border-none cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
                <Avatar
                    src={session.user.image || undefined}
                    alt={session.user.name || "User"}
                    initials={userInitials}
                    size="md"
                />
            </AriaButton>
            <Popover className="w-80">
                <div className="rounded-lg bg-primary p-1 shadow-lg ring-1 ring-border-secondary">
                    <div className="border-b border-secondary p-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={session.user.image || undefined}
                                alt={session.user.name || "User"}
                                initials={userInitials}
                                size="lg"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary truncate">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-tertiary truncate">
                                    {session.user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-1">
                        <button
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className={cx(
                                "flex w-full items-center gap-3 rounded-md px-3 py-2",
                                "text-sm text-secondary hover:bg-secondary hover:text-primary",
                                "transition-colors duration-150"
                            )}
                        >
                            <LogOut01 className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </Popover>
        </DialogTrigger>
    );
};
