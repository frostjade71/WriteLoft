import { getWorkspaceById } from "../../actions";
import { getNotes, createNote } from "./actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { Header } from "@/components/layout/Header";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { MemberItem } from "./MemberItem";
import { NoteItem } from "./NoteItem";

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
            } mobileMenuButton={<MobileMenuButton />} />
            <div className="flex-1 p-4 md:p-8">

                <WorkspaceHeader workspace={workspace} isOwner={isOwner} />

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
                                    <NoteItem
                                        key={note.id}
                                        note={note}
                                        workspaceId={workspace.id}
                                        canEdit={canEdit}
                                    />
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
                                        <MemberItem
                                            key={member.user.id}
                                            member={member}
                                            currentUserId={currentUserId}
                                            isOwner={isOwner}
                                            workspaceId={workspace.id}
                                        />
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
