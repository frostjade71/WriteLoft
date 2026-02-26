import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { SuggestionProps } from "@tiptap/suggestion";

interface MentionNode {
    id: string;
    label: string;
    avatarUrl?: string;
}

export const MentionList = forwardRef((props: SuggestionProps<MentionNode>, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item.id, label: item.label });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }

            if (event.key === "Enter") {
                enterHandler();
                return true;
            }

            return false;
        }
    }));

    if (!props.items.length) {
        return (
            <div className="bg-surface rounded-md border border-border p-2 shadow-lg w-48 text-sm text-muted">
                No results
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-md border border-border py-1 shadow-lg w-48 overflow-hidden z-50">
            {props.items.map((item, index) => (
                <button
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${index === selectedIndex ? "bg-primary/20 text-primary" : "text-foreground hover:bg-background"
                        }`}
                    key={item.id}
                    onClick={() => selectItem(index)}
                >
                    {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-medium">
                            {item.label[0]?.toUpperCase()}
                        </div>
                    )}
                    <span className="truncate">{item.label}</span>
                </button>
            ))}
        </div>
    );
});

MentionList.displayName = "MentionList";
