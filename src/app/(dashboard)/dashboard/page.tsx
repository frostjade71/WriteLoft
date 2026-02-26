import { getWorkspaces, createWorkspace } from "../actions";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default async function DashboardPage() {
    const workspaces = await getWorkspaces();

    return (
        <div className="flex flex-col h-full">
            <Header breadcrumbs={<span className="text-foreground">Workspaces</span>} />

            <div className="flex-1 p-8">
                {/* Header Text */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground title-splash">Workspaces</h1>
                    <p className="mt-1 text-sm text-muted">
                        Create and manage your collaborative workspaces
                    </p>
                </div>

                {/* Create Workspace Form */}
                <form action={createWorkspace} className="mb-8">
                    <div className="flex gap-3">
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="New workspace name..."
                            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover cursor-pointer"
                        >
                            + Create
                        </button>
                    </div>
                </form>

                {/* Workspace Grid */}
                {workspaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16">
                        <svg
                            className="mb-4 h-12 w-12 text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-foreground">
                            No workspaces yet
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                            Create your first workspace to get started
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {workspaces.map(
                            (ws: {
                                id: string;
                                name: string;
                                created_at: string;
                                workspace_members: { role: string }[];
                                owner: { name: string; email: string } | null;
                            }) => (
                                <Link
                                    key={ws.id}
                                    href={`/workspace/${ws.id}`}
                                    className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/50 hover:bg-surface-hover"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {ws.name}
                                        </h3>
                                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                                            {ws.workspace_members?.[0]?.role || "member"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted">
                                        Owner: {ws.owner?.name || ws.owner?.email || "—"}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        Created{" "}
                                        {new Date(ws.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </Link>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
