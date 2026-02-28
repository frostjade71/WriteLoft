import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

// Custom Yjs Provider for Supabase Realtime
export class SupabaseProvider {
    public doc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    private channel: RealtimeChannel;
    private isSynced: boolean = false;
    private isSubscribed: boolean = false;
    private resyncInterval: any;
    private destroyed: boolean = false;
    public onSyncCallback?: () => void;

    constructor(
        doc: Y.Doc,
        supabase: SupabaseClient,
        channelName: string,
        private config: {
            onConnect?: () => void;
            onDisconnect?: () => void;
            onSync?: (isSynced: boolean) => void;
        } = {}
    ) {
        this.doc = doc;
        this.awareness = new awarenessProtocol.Awareness(doc);

        // 1. Join the Supabase channel
        this.channel = supabase.channel(channelName, {
            config: { broadcast: { ack: false } },
        });

        // 2. Listen for remote Yjs document updates
        this.channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
            if (this.destroyed) return;
            try {
                const update = new Uint8Array(payload.update);
                Y.applyUpdate(this.doc, update, this);
            } catch (e) {
                console.warn("[YJS] Failed to apply remote update:", e);
            }
        });

        // 3. Listen for remote awareness (cursor) updates
        this.channel.on("broadcast", { event: "yjs-awareness" }, ({ payload }) => {
            if (this.destroyed) return;
            const update = new Uint8Array(payload.update);
            awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
        });

        // 4. Request full state sync from other peers on join
        this.channel.on("broadcast", { event: "yjs-sync-request" }, () => {
            if (this.destroyed || !this.isSubscribed) return;
            // Respond with our full state
            this.sendBroadcast("yjs-sync-response", {
                update: Array.from(Y.encodeStateAsUpdate(this.doc)),
            });
        });

        this.channel.on("broadcast", { event: "yjs-sync-response" }, ({ payload }) => {
            if (this.destroyed) return;
            try {
                const update = new Uint8Array(payload.update);
                Y.applyUpdate(this.doc, update, this);
                if (!this.isSynced) {
                    this.isSynced = true;
                    this.config.onSync?.(true);
                    this.onSyncCallback?.();
                }
            } catch (e) {
                console.warn("[YJS] Failed to apply sync response:", e);
            }
        });

        // 5. Broadcast local document updates
        this.doc.on("update", this.onUpdate);

        // 6. Broadcast local awareness updates
        this.awareness.on("update", this.onAwarenessUpdate);

        // Subscribe to the channel - only send after SUBSCRIBED
        this.channel.subscribe((status) => {
            if (this.destroyed) return;

            if (status === "SUBSCRIBED") {
                this.isSubscribed = true;
                this.config.onConnect?.();

                // Ask for current state from peers
                this.sendBroadcast("yjs-sync-request", {});

                // Broadcast local awareness periodically to keep it alive
                this.resyncInterval = setInterval(() => {
                    if (this.destroyed || !this.isSubscribed) return;
                    if (this.awareness.getLocalState() !== null) {
                        const update = awarenessProtocol.encodeAwarenessUpdate(
                            this.awareness,
                            [this.doc.clientID]
                        );
                        this.sendBroadcast("yjs-awareness", {
                            update: Array.from(update),
                        });
                    }
                }, 5000);
            } else {
                this.isSubscribed = false;
                this.isSynced = false;
                this.config.onSync?.(false);
                if (status === "CLOSED" || status === "CHANNEL_ERROR") {
                    this.config.onDisconnect?.();
                }
            }
        });
    }

    /**
     * Only send via WebSocket when subscribed. 
     * Avoids the REST API fallback that doesn't broadcast to other clients.
     */
    private sendBroadcast(event: string, payload: any) {
        if (!this.isSubscribed || this.destroyed) return;
        this.channel.send({
            type: "broadcast",
            event,
            payload,
        });
    }

    private onUpdate = (update: Uint8Array, origin: any) => {
        // Only broadcast if the update came from local changes, not from network.
        if (origin !== this) {
            this.sendBroadcast("yjs-update", {
                update: Array.from(update),
            });
        }
    };

    private onAwarenessUpdate = (
        { added, updated, removed }: any,
        origin: any
    ) => {
        if (origin !== this) {
            const changedClients = added.concat(updated).concat(removed);
            const update = awarenessProtocol.encodeAwarenessUpdate(
                this.awareness,
                changedClients
            );
            this.sendBroadcast("yjs-awareness", {
                update: Array.from(update),
            });
        }
    };

    public destroy() {
        this.destroyed = true;
        this.isSubscribed = false;
        clearInterval(this.resyncInterval);
        this.doc.off("update", this.onUpdate);
        this.awareness.off("update", this.onAwarenessUpdate);
        this.channel.unsubscribe();
    }
}
