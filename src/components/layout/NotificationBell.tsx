"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getNotifications, markAsRead } from "./actions";
import { createClient } from "@/lib/supabase/client";

interface Notification {
    id: string;
    type: "mention" | "invite" | "delete";
    ref_id: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();

    // Fetch notifications initially
    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications();
            setNotifications(data);
        };
        fetchNotifications();

        // Subscribe to real-time notifications
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => [newNotification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );

        await markAsRead(id);
    };

    const getNotificationMessage = (n: Notification) => {
        switch (n.type) {
            case "mention":
                return "You were mentioned in a comment.";
            case "invite":
                return "You have a new workspace invitation.";
            case "delete":
                return "A note was deleted in your workspace.";
            default:
                return "New activity.";
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                suppressHydrationWarning
                className="relative p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-surface"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-danger animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-surface">
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted">
                                    All caught up! No recent activity.
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <li
                                            key={n.id}
                                            className={`p-4 transition-colors hover:bg-surface ${!n.is_read ? 'bg-primary/5' : ''}`}
                                            onClick={() => {
                                                if (!n.is_read) handleMarkAsRead(n.id);
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 shrink-0">
                                                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                        {getNotificationMessage(n)}
                                                    </p>
                                                    <p className="text-xs text-muted mt-1">
                                                        {formatDistanceToNow(new Date(n.created_at))} ago
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
