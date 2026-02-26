"use client";

import { type Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo,
    Redo,
} from "lucide-react";

interface ToolbarProps {
    editor: Editor;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}

export function Toolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    const ToolbarButton = ({
        onClick,
        isActive,
        disabled = false,
        children,
    }: ToolbarButtonProps) => (
        <button
            onClick={onClick}
            disabled={disabled}
            type="button"
            className={`rounded p-2 transition-colors cursor-pointer ${isActive
                ? "bg-primary/20 text-primary"
                : "text-muted hover:bg-surface hover:text-foreground"
                } ${disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted" : ""}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface/50 px-8 py-2 sticky top-[73px] z-10 backdrop-blur-sm">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
            >
                <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
            >
                <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
            >
                <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
            >
                <Code size={16} />
            </ToolbarButton>

            <div className="mx-2 h-6 w-px bg-border" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
            >
                <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
            >
                <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
            >
                <Heading3 size={16} />
            </ToolbarButton>

            <div className="mx-2 h-6 w-px bg-border" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
            >
                <List size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
            >
                <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
            >
                <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
            >
                <Code size={16} />
            </ToolbarButton>

            <div className="mx-2 h-6 w-px bg-border" />

            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus size={16} />
            </ToolbarButton>

            <div className="ml-auto flex gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo size={16} />
                </ToolbarButton>
            </div>
        </div>
    );
}
