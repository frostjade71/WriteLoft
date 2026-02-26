import { getNoteById, deleteNote, getCommentsByNoteId } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { CommentSection } from "@/components/editor/CommentSection";
import { Header } from "@/components/layout/Header";

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

    // Since we don't fetch the current user's full name here easily, we construct a basic object
    // Next step will use the Supabase auth session to get the real name
    const currentUser = {
        id: currentUserId,
        name: "Me", // We'll refine this later or get from context
        color: getUserColor(currentUserId)
    };

    const workspaceMembers = note.workspace?.workspace_members?.map((member: any) => ({
        id: member.user.id,
        name: member.user.name || member.user.email,
        avatarUrl: member.user.avatar_url,
    })) || [];

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
                    <form action={deleteNote}>
                        <input type="hidden" name="noteId" value={note.id} />
                        <input type="hidden" name="workspaceId" value={workspaceId} />
                        <button
                            type="submit"
                            className="text-sm font-medium text-danger hover:text-danger/80 transition-colors cursor-pointer block"
                        >
                            Delete Note
                        </button>
                    </form>
                ) : undefined}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
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

                {/* Comments Sidebar */}
                <CommentSection
                    noteId={note.id}
                    currentUser={currentUser}
                    initialComments={initialComments as any}
                    workspaceMembers={workspaceMembers}
                />
            </div>
        </div>
    );
}
