import { getWorkspaceById, deleteWorkspace } from "../../actions";
import { getNotes, createNote, deleteNote, removeMember } from "./actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { Header } from "@/components/layout/Header";

export default async function WorkspacePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await getWorkspaceById(id);

    if (!result || !result.workspace) {
        notFound();
    }

    const { workspace, currentUserId } = result;
    const isOwner = workspace.owner_id === currentUserId;

    // Check if current user is owner or editor
    const currentUserRole = workspace.workspace_members?.find(
        (m: any) => m.user.id === currentUserId
    )?.role || "viewer";

    const canEdit = currentUserRole === "owner" || currentUserRole === "editor";

    // Fetch notes for this workspace
    const notes = await getNotes(workspace.id);

    return (
        <div className="flex flex-col h-full">
            <Header breadcrumbs={
                <>
                    <Link
                        href="/dashboard"
                        className="transition-colors hover:text-foreground"
                    >
                        Workspaces
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{workspace.name}</span>
                </>
            } />
            <div className="flex-1 p-8">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground title-splash">
                            {workspace.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Created{" "}
                            {new Date(workspace.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}{" "}
                            by {workspace.owner?.name || workspace.owner?.email || "Unknown"}
                        </p>
                    </div>
                    {isOwner && (
                        <form action={deleteWorkspace}>
                            <input type="hidden" name="workspaceId" value={workspace.id} />
                            <button
                                type="submit"
                                className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 cursor-pointer"
                            >
                                Delete Workspace
                            </button>
                        </form>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Area (Notes) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">Notes</h2>
                            {canEdit && (
                                <form action={createNote}>
                                    <input type="hidden" name="workspaceId" value={workspace.id} />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer"
                                    >
                                        + New Note
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {notes.length === 0 ? (
                                <div className="col-span-full rounded-xl border border-border border-dashed p-8 text-center text-muted">
                                    No notes yet. Create one to start collaborating!
                                </div>
                            ) : (
                                notes.map((note: any) => (
                                    <div
                                        key={note.id}
                                        className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/50 hover:bg-surface-hover"
                                    >
                                        {/* Clickable area for the whole card */}
                                        <Link
                                            href={`/workspace/${workspace.id}/note/${note.id}`}
                                            className="absolute inset-0 z-0 rounded-xl"
                                            aria-label={`Open note ${note.title}`}
                                        />

                                        <div className="pointer-events-none z-10">
                                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                {note.title}
                                            </h3>
                                            <p className="mt-2 text-xs text-muted truncate">
                                                Last edited {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                                            </p>
                                            <p className="mt-1 text-xs text-muted truncate">
                                                by {note.author?.name || note.author?.email || "Unknown"}
                                            </p>
                                        </div>

                                        {canEdit && (
                                            <div className="mt-4 flex justify-end relative z-10">
                                                <form action={deleteNote} className="opacity-0 transition-opacity group-hover:opacity-100">
                                                    <input type="hidden" name="noteId" value={note.id} />
                                                    <input type="hidden" name="workspaceId" value={workspace.id} />
                                                    <button
                                                        type="submit"
                                                        className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger cursor-pointer block"
                                                        title="Delete note"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Members) */}
                    <div>
                        <div className="rounded-xl border border-border bg-surface flex flex-col h-full">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Members</h2>
                                    <p className="text-sm text-muted">
                                        {workspace.workspace_members?.length || 0} member
                                        {workspace.workspace_members?.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {canEdit && (
                                    <InviteMemberModal workspaceId={workspace.id} />
                                )}
                            </div>
                            <div className="divide-y divide-border flex-1 overflow-y-auto max-h-[600px]">
                                {workspace.workspace_members?.map(
                                    (member: {
                                        role: string;
                                        user: {
                                            id: string;
                                            name: string;
                                            email: string;
                                            avatar_url: string;
                                        };
                                    }) => (
                                        <div
                                            key={member.user.id}
                                            className="group flex flex-col px-5 py-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                                        {member.user.name?.[0]?.toUpperCase() ||
                                                            member.user.email?.[0]?.toUpperCase() ||
                                                            "?"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {member.user.name || "Unnamed"}
                                                            {member.user.id === currentUserId && (
                                                                <span className="ml-2 text-xs text-muted">(you)</span>
                                                            )}
                                                        </p>
                                                        <p className="truncate text-xs text-muted">{member.user.email}</p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${member.role === "owner"
                                                        ? "bg-primary/10 text-primary"
                                                        : member.role === "editor"
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "bg-muted/20 text-muted"
                                                        }`}
                                                >
                                                    {member.role}
                                                </span>
                                            </div>

                                            {/* Remove Member Button */}
                                            {isOwner && member.user.id !== currentUserId && (
                                                <div className="mt-2 flex justify-end">
                                                    <form action={removeMember} className="opacity-0 transition-opacity group-hover:opacity-100">
                                                        <input type="hidden" name="workspaceId" value={workspace.id} />
                                                        <input type="hidden" name="userId" value={member.user.id} />
                                                        <button
                                                            type="submit"
                                                            className="text-xs font-medium text-danger hover:text-danger/80 transition-colors cursor-pointer"
                                                        >
                                                            Remove
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
