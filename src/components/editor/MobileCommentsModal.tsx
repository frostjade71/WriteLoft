"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { CommentSection } from "./CommentSection";

interface MobileCommentsModalProps {
    noteId: string;
    currentUser: { id: string; name: string; avatarUrl?: string };
    initialComments: any[];
    workspaceMembers?: { id: string; name: string; avatarUrl?: string }[];
}

export function MobileCommentsModal({
    noteId,
    currentUser,
    initialComments,
    workspaceMembers,
}: MobileCommentsModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on ESC
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen]);

    return (
        <>
            {/* Chat icon button — visible only on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden flex items-center justify-center rounded-lg p-1.5 border-none bg-transparent cursor-pointer text-muted transition-colors hover:text-primary hover:bg-surface-hover relative"
                title="Comments"
                aria-label="Open comments"
            >
                <MessageCircle size={22} />
            </button>

            {/* Full-screen modal overlay on mobile */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
                    {/* Modal Header */}
                    <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <MessageCircle size={18} className="text-primary" />
                            Comments
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
                            aria-label="Close comments"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Comment Section fills the rest */}
                    <div className="flex-1 overflow-hidden">
                        <CommentSection
                            noteId={noteId}
                            currentUser={currentUser}
                            initialComments={initialComments}
                            workspaceMembers={workspaceMembers}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
