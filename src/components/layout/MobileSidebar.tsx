"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useMobileSidebar } from "./MobileSidebarContext";

interface MobileSidebarProps {
    profile: {
        name: string | null;
        email: string | null;
        avatar_url: string | null;
    } | null;
    userEmail: string | undefined;
    signOutAction: () => Promise<void>;
}

export function MobileSidebar({ profile, userEmail, signOutAction }: MobileSidebarProps) {
    const { isOpen, close } = useMobileSidebar();

    // Close on ESC key & lock body scroll
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") close();
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, close]);

    const handleLinkClick = useCallback(() => {
        close();
    }, [close]);

    return (
        <>
            {/* Overlay Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={close}
            />

            {/* Slide-in Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col bg-surface border-r border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header with close button */}
                <div className="flex h-16 items-center justify-between border-b border-border px-5">
                    <Link
                        href="/dashboard"
                        className="text-xl font-bold tracking-tight"
                        onClick={handleLinkClick}
                    >
                        <span className="text-primary">Write</span>Loft
                    </Link>
                    <button
                        onClick={close}
                        className="flex items-center justify-center rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
                        aria-label="Close sidebar menu"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4">
                    <Link
                        href="/dashboard"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                    >
                        <svg
                            className="h-5 w-5 text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
                            />
                        </svg>
                        Workspaces
                    </Link>
                </nav>

                {/* User profile & Sign out */}
                <div className="border-t border-border p-4">
                    <div className="mb-3 flex items-center gap-3 px-3">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                {profile?.name?.[0]?.toUpperCase() ||
                                    userEmail?.[0]?.toUpperCase() ||
                                    "?"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {profile?.name || "User"}
                            </p>
                            <p className="truncate text-xs text-muted">
                                {userEmail}
                            </p>
                        </div>
                    </div>
                    <form action={signOutAction}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                                />
                            </svg>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
