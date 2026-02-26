"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, MoreHorizontal, Trash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Comment {
    id: string;
    body: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        avatar_url: string;
    };
}

interface CommentSectionProps {
    noteId: string;
    currentUser: { id: string; name: string; avatarUrl?: string };
    initialComments: Comment[];
    workspaceMembers?: { id: string; name: string }[];
}

export function CommentSection({
    noteId,
    currentUser,
    initialComments,
    workspaceMembers,
}: CommentSectionProps) {
    const supabase = createClient();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial scroll
    useEffect(() => {
        if (comments.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "instant" });
        }
    }, []);

    // Function to parse mentions and render them as stylized elements
    const renderCommentBody = (body: string) => {
        const mentionRegex = /(@\w+(?:\s\w+)?)/g;
        const parts = body.split(mentionRegex);

        return parts.map((part, index) => {
            if (part.match(mentionRegex)) {
                return (
                    <span key={index} className="bg-primary/20 text-primary px-1 py-0.5 rounded text-sm font-medium">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const handleCreateComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const optimisticComment: Comment = {
                id: tempId,
                body: newComment.trim(),
                created_at: new Date().toISOString(),
                user: {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar_url: currentUser.avatarUrl || "",
                },
            };

            setComments((prev) => [...prev, optimisticComment]);
            setNewComment("");

            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

            // DB Insert
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    note_id: noteId,
                    user_id: currentUser.id,
                    body: optimisticComment.body
                })
                .select(`
                    id, 
                    body, 
                    created_at, 
                    user:users!comments_user_id_fkey(id, name, avatar_url)
                `)
                .single();

            if (error) throw error;

            if (data) {
                // Detect Mentions and create Notifications
                const mentionRegex = /(@\w+(?:\s\w+)?)/g;
                const matches = optimisticComment.body.match(mentionRegex) || [];

                // Extract proper names by removing the '@'
                const mentionedNames = matches.map(m => m.substring(1).trim().toLowerCase());

                if (mentionedNames.length > 0 && workspaceMembers) {
                    // Find actual workspace members matching these names
                    const matchedUsers = workspaceMembers.filter(member =>
                        mentionedNames.some(name => member.name.toLowerCase().startsWith(name)) &&
                        member.id !== currentUser.id // don't notify self
                    );

                    if (matchedUsers.length > 0) {
                        const newNotifications = matchedUsers.map(user => ({
                            user_id: user.id,
                            type: 'mention',
                            ref_id: data.id,
                            is_read: false
                        }));

                        // Insert notifications silently in background
                        await supabase.from('notifications').insert(newNotifications);
                    }
                }

                // We map the return data cleanly since our interface expects it flattened
                const cleanlyFormattedData: Comment = {
                    id: data.id,
                    body: data.body,
                    created_at: data.created_at,
                    user: Array.isArray(data.user) ? data.user[0] : (data.user as any)
                };

                setComments((prev) =>
                    prev.map((c) => (c.id === tempId ? cleanlyFormattedData : c))
                );
            }
        } catch (error) {
            console.error("Failed to post comment", error);
            // Revert optimisic addition
            setComments(comments);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (commentId.startsWith('temp-')) return;

        // Optimistic delete
        const prevComments = [...comments];
        setComments((prev) => prev.filter((c) => c.id !== commentId));

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error("Failed to delete comment", error);
            setComments(prevComments); // revert
        }
    };

    return (
        <div className="flex h-full flex-col border-l border-border bg-surface w-80 shrink-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sticky top-0 bg-surface z-10">
                <h3 className="font-semibold text-foreground">Comments</h3>
                <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center text-muted text-sm mt-10">
                        No comments yet.<br />Be the first to share your thoughts!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group relative">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="shrink-0 mt-1">
                                    {comment.user.avatar_url ? (
                                        <img src={comment.user.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                            {comment.user.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {comment.user.name}
                                            </span>
                                            <span className="text-xs text-muted whitespace-nowrap">
                                                {formatDistanceToNow(new Date(comment.created_at))} ago
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {(currentUser.id === comment.user.id || true) && ( // Usually check 'canEdit' or owner role here too
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted hover:text-danger rounded"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-1 text-sm text-foreground/90 break-words">
                                        {renderCommentBody(comment.body)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-border bg-background">
                <form onSubmit={handleCreateComment} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment... (use @ to mention)"
                        className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleCreateComment(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-2 bottom-3 p-1.5 text-white bg-primary rounded-md disabled:bg-primary/50 disabled:text-white/50 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
