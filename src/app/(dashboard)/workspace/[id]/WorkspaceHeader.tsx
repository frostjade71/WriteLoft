"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, AlertTriangle } from "lucide-react";
import { updateWorkspaceName } from "./headerActions";
import { deleteWorkspace } from "../../actions";

interface WorkspaceHeaderProps {
    workspace: {
        id: string;
        name: string;
        created_at: string;
        owner?: {
            name: string;
            email: string;
        } | null;
    };
    isOwner: boolean;
}

export function WorkspaceHeader({ workspace, isOwner }: WorkspaceHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workspace.name);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!name.trim() || name === workspace.name) {
            setIsEditing(false);
            setName(workspace.name);
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append("workspaceId", workspace.id);
        formData.append("name", name.trim());

        const result = await updateWorkspaceName(formData);

        if (result.error) {
            setName(workspace.name);
        }

        setIsSaving(false);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setName(workspace.name);
        }
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        const formData = new FormData();
        formData.append("workspaceId", workspace.id);
        deleteWorkspace(formData);
    };

    return (
        <>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                disabled={isSaving}
                                className="text-2xl font-bold bg-surface border border-primary px-2 py-0.5 rounded outline-none focus:ring-2 focus:ring-primary/50 text-foreground title-splash w-[300px]"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-foreground title-splash flex items-center gap-2 group">
                                {workspace.name}
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1.5 rounded-md text-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-surface hover:text-foreground active:scale-95 cursor-pointer"
                                        aria-label="Rename workspace"
                                        title="Rename workspace"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                )}
                            </h1>
                        )}
                    </div>
                    {!isEditing && (
                        <p className="mt-1 text-sm text-muted">
                            Created{" "}
                            {new Date(workspace.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}{" "}
                            by {workspace.owner?.name || workspace.owner?.email || "Unknown"}
                        </p>
                    )}
                </div>

                {isOwner && (
                    <button
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={isSaving}
                        className="group relative p-2 border-none bg-transparent cursor-pointer transition-transform duration-200 ease-in-out disabled:opacity-50"
                        title="Delete Workspace"
                        aria-label="Delete Workspace"
                    >
                        <svg
                            className="w-7 h-7 overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.08] group-hover:rotate-3 group-active:scale-[0.96] group-active:-rotate-1"
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
                            <h2 className="text-lg font-bold">Delete Workspace?</h2>
                        </div>

                        <p className="text-sm text-foreground/80 mb-6">
                            Are you sure you want to delete <strong className="text-foreground">{workspace.name}</strong>? This action is permanent and will delete all notes inside it.
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
