"use client";

import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { inviteMember } from "@/app/(dashboard)/workspace/[id]/actions";

export function InviteMemberModal({ workspaceId }: { workspaceId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        // append workspaceId explicitly
        formData.append("workspaceId", workspaceId);

        try {
            const result = await inviteMember(formData);
            if (result && result.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-foreground border border-border transition-colors hover:bg-surface-hover flex items-center gap-2 cursor-pointer"
            >
                <UserPlus size={16} />
                Invite
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-surface rounded-xl border border-border shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <UserPlus size={18} className="text-primary" />
                                Invite Member
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-surface-hover cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="colleague@example.com"
                                        required
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted"
                                    />
                                    <p className="mt-1 text-xs text-muted">
                                        Must be an existing registered user.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        defaultValue="editor"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                                    >
                                        <option value="editor">Editor (Can edit notes)</option>
                                        <option value="viewer">Viewer (Read-only)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Inviting...
                                        </>
                                    ) : (
                                        "Send Invite"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
