"use client";

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mention from "@tiptap/extension-mention";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { common, createLowlight } from "lowlight";
import * as Y from "yjs";
import { prosemirrorJSONToYDoc } from "y-prosemirror";
import { getSchema } from "@tiptap/core";
import { useEffect, useState, useRef } from "react";
import { Toolbar } from "./Toolbar";
import { PresenceIndicator } from "./PresenceIndicator";
import { MentionList } from "./MentionList";
import { createClient } from "@/lib/supabase/client";
import { updateNoteContent } from "@/app/(dashboard)/workspace/[id]/actions";
import { SupabaseProvider } from "@/lib/yjs/SupabaseProvider";
import "./editor.css";

const lowlight = createLowlight(common);

interface EditorProps {
    noteId: string;
    initialContent: any;
    title: string;
    currentUser: { id: string; name: string; color: string };
    canEdit: boolean;
    workspaceMembers: { id: string; name: string; avatarUrl?: string }[];
}

export function Editor(props: EditorProps) {
    const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<SupabaseProvider | null>(null);
    const [docReady, setDocReady] = useState(false);

    // Initialize Yjs and Supabase Realtime Provider
    useEffect(() => {
        const doc = new Y.Doc();
        setYdoc(doc);

        const supabase = createClient();
        const newProvider = new SupabaseProvider(doc, supabase, `note-${props.noteId}`, {
            onConnect: () => console.log("Connected to collab room"),
            onDisconnect: () => console.log("Disconnected from collab room"),
        });

        // Wait for peer sync before loading from DB.
        // If a peer responds, we get their Y.Doc state (no DB load needed).
        // If no peer responds within 1.5s, load initial content from the database.
        // TipTap is NOT rendered until one of these completes (docReady).
        let peerSynced = false;

        newProvider.onSyncCallback = () => {
            peerSynced = true;
            setDocReady(true);
        };

        const dbFallbackTimer = setTimeout(() => {
            if (!peerSynced) {
                if (props.initialContent) {
                    try {
                        const schema = getSchema([
                            StarterKit.configure({ history: false, codeBlock: false }),
                            CodeBlockLowlight.configure({ lowlight }),
                            Placeholder,
                        ]);
                        const tempDoc = prosemirrorJSONToYDoc(schema, props.initialContent, "default");
                        const update = Y.encodeStateAsUpdate(tempDoc);
                        Y.applyUpdate(doc, update);
                        tempDoc.destroy();
                    } catch (e) {
                        console.warn("[YJS] Failed to preload initial content:", e);
                    }
                }
                setDocReady(true);
            }
        }, 1500);

        setProvider(newProvider);

        return () => {
            clearTimeout(dbFallbackTimer);
            newProvider.destroy();
            doc.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.noteId]);

    // Update awareness when currentUser changes (separate from provider lifecycle)
    useEffect(() => {
        if (provider) {
            provider.awareness.setLocalStateField("user", props.currentUser);
        }
    }, [provider, props.currentUser]);

    if (!ydoc || !provider || !docReady) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-background text-muted-foreground">
                <div className="animate-pulse">Loading editor workspace...</div>
            </div>
        );
    }

    return <TiptapEditor {...props} ydoc={ydoc} provider={provider} />;
}

interface TiptapEditorProps extends EditorProps {
    ydoc: Y.Doc;
    provider: SupabaseProvider;
}

function TiptapEditor({
    noteId,
    initialContent,
    title,
    currentUser,
    canEdit,
    workspaceMembers,
    ydoc,
    provider,
}: TiptapEditorProps) {
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
    const [currentTitle, setCurrentTitle] = useState(title);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
                codeBlock: false, // Prevent duplicate extension warning
            }),
            Placeholder.configure({
                placeholder: "Start typing here... Use @ to tag teammates",
                emptyEditorClass: "is-editor-empty",
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({ provider, user: currentUser }),
            Mention.configure({
                HTMLAttributes: {
                    class: "mention",
                },
                suggestion: {
                    items: ({ query }: { query: string }) => {
                        return workspaceMembers
                            .filter((item) => item.name.toLowerCase().startsWith(query.toLowerCase()))
                            .map(member => ({ id: member.id, label: member.name, avatarUrl: member.avatarUrl }))
                            .slice(0, 5);
                    },
                    render: () => {
                        let component: ReactRenderer;
                        let popup: TippyInstance[];

                        return {
                            onStart: (props: any) => {
                                component = new ReactRenderer(MentionList, {
                                    props,
                                    editor: props.editor,
                                });

                                if (!props.clientRect) {
                                    return;
                                }

                                popup = tippy("body", {
                                    getReferenceClientRect: props.clientRect as () => DOMRect,
                                    appendTo: () => document.body,
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: "manual",
                                    placement: "bottom-start",
                                });
                            },
                            onUpdate(props: any) {
                                component?.updateProps(props);

                                if (!props.clientRect) {
                                    return;
                                }

                                popup?.[0].setProps({
                                    getReferenceClientRect: props.clientRect as () => DOMRect,
                                });
                            },
                            onKeyDown(props: any) {
                                if (props.event.key === "Escape") {
                                    popup?.[0].hide();
                                    return true;
                                }
                                return (component?.ref as any)?.onKeyDown(props);
                            },
                            onExit() {
                                popup?.[0].destroy();
                                component?.destroy();
                            },
                        };
                    },
                },
            }),
        ],
        // Do not pass initialContent directly when using Collaboration!
        // The ydoc will handle initialization.
        content: undefined,
        editable: canEdit,
        immediatelyRender: false,
    });

    // Auto-save with proper debouncing via ref
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!editor || !canEdit) return;

        const handleUpdate = () => {
            setSaveStatus("saving");

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(async () => {
                try {
                    await updateNoteContent(noteId, editor.getJSON(), currentTitle);
                    setSaveStatus("saved");
                } catch (e) {
                    console.error("Auto-save failed:", e);
                }
            }, 3000);
        };

        editor.on("update", handleUpdate);

        return () => {
            editor.off("update", handleUpdate);
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [editor, canEdit, noteId, currentTitle]);

    const handleTitleBlur = async () => {
        if (currentTitle !== title && canEdit) {
            setSaveStatus("saving");
            await updateNoteContent(noteId, editor?.getJSON() || initialContent, currentTitle);
            setSaveStatus("saved");
        }
    };

    if (!editor) return null;

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border bg-background px-8 py-4 sticky top-0 z-10">
                <div className="title-splash flex-1 mr-4">
                    <input
                        type="text"
                        value={currentTitle}
                        onChange={(e) => setCurrentTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        readOnly={!canEdit}
                        className="bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted focus:ring-0 w-full truncate"
                        placeholder="Note Title"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted">
                        {saveStatus === "saving" ? "Saving..." : "Saved"}
                    </span>
                    <PresenceIndicator editor={editor} provider={provider} currentUser={currentUser} />
                </div>
            </div>

            {canEdit && <Toolbar editor={editor} />}

            <div className="flex-1 overflow-y-auto bg-background p-8">
                <div className="mx-auto max-w-3xl">
                    <EditorContent editor={editor} className="prose prose-invert max-w-none focus:outline-none" />
                </div>
            </div>
        </div>
    );
}

