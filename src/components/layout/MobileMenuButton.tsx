"use client";

import { useMobileSidebar } from "./MobileSidebarContext";

export function MobileMenuButton() {
    const { open } = useMobileSidebar();

    return (
        <button
            onClick={open}
            className="md:hidden flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Open sidebar menu"
        >
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
            </svg>
        </button>
    );
}
