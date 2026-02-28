"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { deleteNote } from "./actions";

interface NoteItemProps {
    note: {
        id: string;
        title: string;
        updated_at: string;
        author?: {
            name: string;
            email: string;
        };
    };
    workspaceId: string;
    canEdit: boolean;
}

export function NoteItem({ note, workspaceId, canEdit }: NoteItemProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        const formData = new FormData();
        formData.append("noteId", note.id);
        formData.append("workspaceId", workspaceId);
        deleteNote(formData);
    };

    return (
        <>
            <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/50 hover:bg-surface-hover">
                {/* Clickable area for the whole card */}
                <Link
                    href={`/workspace/${workspaceId}/note/${note.id}`}
                    className="absolute inset-0 z-0 rounded-xl"
                    aria-label={`Open note ${note.title}`}
                />

                <div className="pointer-events-none z-10">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {note.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted truncate">
                        Last edited {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                    </p>
                    <p className="mt-1 text-xs text-muted truncate">
                        by {note.author?.name || note.author?.email || "Unknown"}
                    </p>
                </div>

                {canEdit && (
                    <div className="mt-4 flex justify-end relative z-10">
                        <button
                            onClick={() => setIsConfirmOpen(true)}
                            className="group/btn relative p-1 border-none bg-transparent cursor-pointer transition-transform duration-200 ease-in-out block opacity-0 group-hover:opacity-100"
                            title="Delete note"
                            aria-label="Delete note"
                        >
                            <svg
                                className="w-6 h-6 overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:scale-[1.08] group-hover/btn:rotate-3 group-active/btn:scale-[0.96] group-active/btn:-rotate-1"
                                viewBox="0 -10 64 74"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g id="trash-can">
                                    <rect x={16} y={24} width={32} height={30} rx={3} ry={3} fill="#e74c3c" />
                                    <g
                                        className="origin-[12px_18px] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:-rotate-[28deg] group-hover/btn:translate-y-[2px] group-active/btn:-rotate-[12deg] group-active/btn:scale-95"
                                    >
                                        <rect x={12} y={12} width={40} height={6} rx={2} ry={2} fill="#c0392b" />
                                        <rect x={26} y={8} width={12} height={4} rx={2} ry={2} fill="#c0392b" />
                                    </g>
                                </g>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-danger mb-4">
                            <div className="p-2 bg-danger/10 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-lg font-bold">Delete Note?</h2>
                        </div>

                        <p className="text-sm text-foreground/80 mb-6">
                            Are you sure you want to delete <strong className="text-foreground">{note.title}</strong>? This action is permanent.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={isDeleting}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
