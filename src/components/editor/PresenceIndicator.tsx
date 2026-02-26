import { type Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

interface PresenceIndicatorProps {
  editor: Editor;
  currentUser: { id: string; name: string; color: string };
}

export function PresenceIndicator({
  editor,
  currentUser,
}: PresenceIndicatorProps) {
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    const updateCollaborators = () => {
      // The collaborationCursor extension stores connected users in its storage
      if ((editor.storage as any).collaborationCursor) {
        setCollaborators((editor.storage as any).collaborationCursor.users);
      }
    };

    editor.on("transaction", updateCollaborators);
    return () => {
      editor.off("transaction", updateCollaborators);
    };
  }, [editor]);

  // Filter out the current user so we don't duplicate
  const otherUsers = collaborators.filter(
    (user) => user.clientId !== (editor.storage as any).collaborationCursor?.clientId
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden">
        {/* Other Users */}
        {otherUsers.map((user) => (
          <div
            key={user.clientId}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white z-0"
            style={{ backgroundColor: user.color || "#888" }}
            title={user.name}
          >
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
        ))}
        {/* Current user */}
        <div
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white z-10"
          style={{ backgroundColor: currentUser.color }}
          title={`${currentUser.name} (You)`}
        >
          {currentUser.name[0]?.toUpperCase() || "?"}
        </div>
      </div>
    </div>
  );
}
