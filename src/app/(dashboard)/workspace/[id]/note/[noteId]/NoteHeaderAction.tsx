"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteNote } from "../../actions";

interface NoteHeaderActionProps {
    note: {
        id: string;
        title: string;
    };
    workspaceId: string;
}

export function NoteHeaderAction({ note, workspaceId }: NoteHeaderActionProps) {
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
            <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isDeleting}
                className="group relative p-1.5 border-none bg-transparent cursor-pointer transition-transform duration-200 ease-in-out disabled:opacity-50"
                title="Delete Note"
                aria-label="Delete Note"
            >
                <svg
                    className="w-6 h-6 overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.08] group-hover:rotate-3 group-active:scale-[0.96] group-active:-rotate-1"
                    viewBox="0 -10 64 74"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g id="trash-can">
                        <rect x={16} y={24} width={32} height={30} rx={3} ry={3} fill="#e74c3c" />
                        <g
                            className="origin-[12px_18px] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[28deg] group-hover:translate-y-[2px] group-active:-rotate-[12deg] group-active:scale-95"
                        >
                            <rect x={12} y={12} width={40} height={6} rx={2} ry={2} fill="#c0392b" />
                            <rect x={26} y={8} width={12} height={4} rx={2} ry={2} fill="#c0392b" />
                        </g>
                    </g>
                </svg>
            </button>

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

                        <p className="text-sm text-foreground/80 mb-6 flex flex-col items-start gap-1">
                            <span>Are you sure you want to delete this note?</span>
                            <strong className="text-foreground border border-border bg-surface-hover px-2 py-0.5 rounded text-xs truncate max-w-full block whitespace-nowrap overflow-hidden text-ellipsis">
                                {note.title}
                            </strong>
                            <span>This action is permanent.</span>
                        </p>

                        <div className="flex justify-end gap-3 mt-4">
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
