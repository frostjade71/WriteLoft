import { getNoteById, getCommentsByNoteId } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { CommentSection } from "@/components/editor/CommentSection";
import { Header } from "@/components/layout/Header";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { NoteHeaderAction } from "./NoteHeaderAction";
import { MobileCommentsModal } from "@/components/editor/MobileCommentsModal";

// Generate a random stable color for the user's cursor
function getUserColor(userId: string) {
    const colors = [
        "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
        "#ec4899", "#f43f5e", "#06b6d4", "#14b8a6"
    ];
    // Simple hash of UUID to pick a consistent color
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export default async function NotePage({
    params,
}: {
    params: Promise<{ id: string; noteId: string }>;
}) {
    const { id: workspaceId, noteId } = await params;

    // Fetch note and comments in parallel
    const [result, initialComments] = await Promise.all([
        getNoteById(noteId),
        getCommentsByNoteId(noteId)
    ]);

    if (!result || !result.note) {
        notFound();
    }

    const { note, currentUserId } = result;

    // Verify this note belongs to the workspace in the URL
    if (note.workspace_id !== workspaceId) {
        notFound();
    }

    // To determine edit permissions, we'd normally check the workspace member role again here
    // For simplicity since RLS already protects writes, we'll allow the editor to render in edit mode
    // The database will reject unauthorized saves
    const canEdit = true;

    const workspaceMembers = note.workspace?.workspace_members?.map((member: any) => ({
        id: member.user.id,
        name: member.user.name || member.user.email,
        avatarUrl: member.user.avatar_url,
    })) || [];

    // Find the current user from the workspace members list to get their real name and avatar
    const currentMember = workspaceMembers.find((m: any) => m.id === currentUserId);

    const currentUser = {
        id: currentUserId,
        name: currentMember?.name || "Me",
        color: getUserColor(currentUserId),
        avatarUrl: currentMember?.avatarUrl
    };

    return (
        <div className="flex flex-col h-full">
            <Header
                breadcrumbs={
                    <>
                        <Link href="/dashboard" className="transition-colors hover:text-foreground">
                            Workspaces
                        </Link>
                        <span>/</span>
                        <Link href={`/workspace/${workspaceId}`} className="transition-colors hover:text-foreground max-w-[150px] truncate">
                            {note.workspace?.name}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground max-w-[200px] truncate">{note.title}</span>
                    </>
                }
                actions={canEdit ? (
                    <div className="flex items-center gap-1">
                        <MobileCommentsModal
                            noteId={note.id}
                            currentUser={currentUser}
                            initialComments={initialComments as any}
                            workspaceMembers={workspaceMembers}
                        />
                        <NoteHeaderAction
                            note={note}
                            workspaceId={workspaceId}
                        />
                    </div>
                ) : (
                    <MobileCommentsModal
                        noteId={note.id}
                        currentUser={currentUser}
                        initialComments={initialComments as any}
                        workspaceMembers={workspaceMembers}
                    />
                )}
                mobileMenuButton={<MobileMenuButton />}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                {/* Editor Area */}
                <div className="flex-1 overflow-hidden relative">
                    <Editor
                        noteId={note.id}
                        initialContent={note.content}
                        title={note.title}
                        currentUser={currentUser}
                        canEdit={canEdit}
                        workspaceMembers={workspaceMembers}
                    />
                </div>

                {/* Comments Sidebar — hidden on mobile, replaced by MobileCommentsModal */}
                <div className="hidden md:block">
                    <CommentSection
                        noteId={note.id}
                        currentUser={currentUser}
                        initialComments={initialComments as any}
                        workspaceMembers={workspaceMembers}
                    />
                </div>
            </div>
        </div>
    );
}
