import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

// Custom Yjs Provider for Supabase Realtime
export class SupabaseProvider {
    public doc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    private channel: RealtimeChannel;
    private isSynced: boolean = false;
    private resyncInterval: any;

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
        this.channel.on("broadcast", { event: "update" }, ({ payload }) => {
            const update = new Uint8Array(payload.update);
            Y.applyUpdate(this.doc, update, this);
        });

        // 3. Listen for remote awareness (cursor) updates
        this.channel.on("broadcast", { event: "awareness" }, ({ payload }) => {
            const update = new Uint8Array(payload.update);
            awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
        });

        // 4. Request full state sync from other peers on join
        this.channel.on("broadcast", { event: "sync-step-1" }, ({ payload }) => {
            const replyPayload = {
                update: Array.from(Y.encodeStateAsUpdate(this.doc)),
            };
            this.channel.send({
                type: "broadcast",
                event: "sync-step-2",
                payload: replyPayload,
            });
        });

        this.channel.on("broadcast", { event: "sync-step-2" }, ({ payload }) => {
            const update = new Uint8Array(payload.update);
            Y.applyUpdate(this.doc, update, this);
            if (!this.isSynced) {
                this.isSynced = true;
                this.config.onSync?.(true);
            }
        });

        // 5. Broadcast local document updates
        this.doc.on("update", this.onUpdate);

        // 6. Broadcast local awareness updates
        this.awareness.on("update", this.onAwarenessUpdate);

        // Subscribe to the channel
        this.channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                this.config.onConnect?.();
                // Ask for current state from peers
                this.channel.send({
                    type: "broadcast",
                    event: "sync-step-1",
                    payload: { stateVector: Array.from(Y.encodeStateVector(this.doc)) },
                });

                // Broadcast local awareness periodically to keep it alive
                this.resyncInterval = setInterval(() => {
                    if (this.awareness.getLocalState() !== null) {
                        const update = awarenessProtocol.encodeAwarenessUpdate(
                            this.awareness,
                            [this.doc.clientID]
                        );
                        this.channel.send({
                            type: "broadcast",
                            event: "awareness",
                            payload: { update: Array.from(update) },
                        });
                    }
                }, 5000);
            } else {
                this.isSynced = false;
                this.config.onSync?.(false);
                if (status === "CLOSED" || status === "CHANNEL_ERROR") {
                    this.config.onDisconnect?.();
                }
            }
        });
    }

    private onUpdate = (update: Uint8Array, origin: any) => {
        // Only broadcast if the update came from local changes, not from network
        if (origin !== this) {
            this.channel.send({
                type: "broadcast",
                event: "update",
                payload: { update: Array.from(update) },
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
            this.channel.send({
                type: "broadcast",
                event: "awareness",
                payload: { update: Array.from(update) },
            });
        }
    };

    public destroy() {
        clearInterval(this.resyncInterval);
        this.doc.off("update", this.onUpdate);
        this.awareness.off("update", this.onAwarenessUpdate);
        this.channel.unsubscribe();
    }
}
