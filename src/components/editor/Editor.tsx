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
import { useEffect, useState } from "react";
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

export function Editor({
    noteId,
    initialContent,
    title,
    currentUser,
    canEdit,
    workspaceMembers,
}: EditorProps) {
    const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<SupabaseProvider | null>(null);
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
    const [currentTitle, setCurrentTitle] = useState(title);

    // Initialize Yjs and Supabase Realtime Provider
    useEffect(() => {
        const doc = new Y.Doc();
        setYdoc(doc);

        const supabase = createClient();
        const newProvider = new SupabaseProvider(doc, supabase, `note-${noteId}`, {
            onConnect: () => console.log("Connected to collab room"),
            onDisconnect: () => console.log("Disconnected from collab room"),
        });

        newProvider.awareness.setLocalStateField("user", currentUser);
        setProvider(newProvider);

        return () => {
            newProvider.destroy();
            doc.destroy();
        };
    }, [noteId, currentUser]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // @ts-expect-error - history configuration is valid but types might be outdated
                history: false,
            }),
            Placeholder.configure({
                placeholder: "Start typing here... Use @ to tag teammates",
                emptyEditorClass: "is-editor-empty",
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
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
        content: ydoc && provider ? undefined : initialContent,
        editable: canEdit,
        onUpdate: () => {
            setSaveStatus("saving");
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!editor || !ydoc || !provider) return;

        editor.extensionManager.extensions.push(
            Collaboration.configure({
                document: ydoc,
            })
        );

        editor.extensionManager.extensions.push(
            CollaborationCursor.configure({
                provider,
                user: currentUser,
            })
        );

        if (ydoc.getText("default").length === 0 && initialContent) {
            editor.commands.setContent(initialContent, { emitUpdate: false });
        }
    }, [editor, ydoc, provider, currentUser, initialContent]);

    // Auto-save effect
    useEffect(() => {
        if (!editor || !canEdit) return;

        const timeout = setTimeout(async () => {
            if (saveStatus === "saving") {
                await updateNoteContent(noteId, editor.getJSON(), currentTitle);
                setSaveStatus("saved");
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [editor?.getJSON(), currentTitle, saveStatus, canEdit, noteId]);

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
                    <PresenceIndicator editor={editor} currentUser={currentUser} />
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
