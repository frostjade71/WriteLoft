import { type Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface PresenceIndicatorProps {
  editor: Editor;
  provider?: any; // SupabaseProvider
  currentUser: { id: string; name: string; color: string; avatarUrl?: string };
}

export function PresenceIndicator({
  provider,
  currentUser,
}: PresenceIndicatorProps) {
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    if (!provider) return;

    const updateCollaborators = () => {
      const states = Array.from(provider.awareness.getStates().values()) as any[];

      // The awareness state contains our local state too, but `user` might be wrapped.
      // E.g., state.user = { id, name, color }
      const users = states
        .map(state => state.user)
        .filter(user => user && user.id); // ensure valid user

      // Deduplicate by ID in case of multiple tabs
      const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
      setCollaborators(uniqueUsers);
    };

    provider.awareness.on("update", updateCollaborators);
    // Initial load
    updateCollaborators();

    return () => {
      provider.awareness.off("update", updateCollaborators);
    };
  }, [provider]);

  // Filter out the current user by ID to avoid duplication
  const otherUsers = collaborators.filter(
    (user) => user.id !== currentUser.id
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden">
        {/* Other Users */}
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white z-0 overflow-hidden"
            style={{ backgroundColor: user.color || "#888" }}
            title={user.name}
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Collaborator"}
                fill
                className="object-cover"
                sizes="32px"
                unoptimized
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="relative z-10">{user.name?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
        ))}
        {/* Current user */}
        <div
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white z-10 overflow-hidden"
          style={{ backgroundColor: currentUser.color }}
          title={`${currentUser.name} (You)`}
        >
          {currentUser.avatarUrl ? (
            <Image
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              fill
              className="object-cover"
              sizes="32px"
              unoptimized
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="relative z-10">{currentUser.name[0]?.toUpperCase() || "?"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
