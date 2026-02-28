"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { removeMember } from "./actions";

interface MemberItemProps {
    member: {
        role: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatar_url: string;
        };
    };
    currentUserId: string;
    isOwner: boolean;
    workspaceId: string;
}

export function MemberItem({ member, currentUserId, isOwner, workspaceId }: MemberItemProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const isSelf = member.user.id === currentUserId;
    const canRemove = isOwner && !isSelf;

    const handleRemoveConfirm = async () => {
        setIsRemoving(true);
        try {
            const formData = new FormData();
            formData.append("workspaceId", workspaceId);
            formData.append("userId", member.user.id);
            await removeMember(formData);

            // Note: Since this redirects/revalidates, the component might unmount.
            // But we can close modals just in case.
            setIsConfirmOpen(false);
            setIsProfileOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <>
            {/* List Item */}
            <div
                className="group flex flex-col px-5 py-3 cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => setIsProfileOpen(true)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {member.user.avatar_url ? (
                            <img
                                src={member.user.avatar_url}
                                alt={member.user.name || member.user.email || "User avatar"}
                                className="h-8 w-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                {member.user.name?.[0]?.toUpperCase() ||
                                    member.user.email?.[0]?.toUpperCase() ||
                                    "?"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {member.user.name || "Unnamed"}
                                {isSelf && (
                                    <span className="ml-2 text-xs text-muted">(you)</span>
                                )}
                            </p>
                            <p className="truncate text-xs text-muted">{member.user.email}</p>
                        </div>
                    </div>
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${member.role === "owner"
                            ? "bg-primary/10 text-primary"
                            : member.role === "editor"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-muted/20 text-muted"
                            }`}
                    >
                        {member.role}
                    </span>
                </div>
            </div>

            {/* Profile Modal */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="absolute right-4 top-4 p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-surface-hover"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            {member.user.avatar_url ? (
                                <img
                                    src={member.user.avatar_url}
                                    alt="Avatar"
                                    className="h-20 w-20 rounded-full object-cover mb-4 ring-4 ring-border"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary mb-4 ring-4 ring-border">
                                    {member.user.name?.[0]?.toUpperCase() ||
                                        member.user.email?.[0]?.toUpperCase() ||
                                        "?"}
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-foreground">
                                {member.user.name || "Unnamed"}
                            </h2>
                            <p className="text-sm text-muted mb-2">{member.user.email}</p>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-6 ${member.role === "owner"
                                    ? "bg-primary/10 text-primary"
                                    : member.role === "editor"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-muted/20 text-muted"
                                    }`}
                            >
                                {member.role}
                            </span>

                            {canRemove && (
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        setIsConfirmOpen(true);
                                    }}
                                    className="w-full rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 hover:border-danger/50 active:scale-95"
                                >
                                    Remove from Workspace
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-danger mb-4">
                            <div className="p-2 bg-danger/10 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-lg font-bold">Remove Member?</h2>
                        </div>

                        <p className="text-sm text-foreground/80 mb-6">
                            Are you sure you want to remove <strong className="text-foreground">{member.user.name || member.user.email}</strong> from this workspace? They will lose all access to its notes.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsConfirmOpen(false);
                                    setIsProfileOpen(true); // go back to profile
                                }}
                                disabled={isRemoving}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveConfirm}
                                disabled={isRemoving}
                                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isRemoving ? "Removing..." : "Yes, Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
