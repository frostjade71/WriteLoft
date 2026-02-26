import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/server";

interface HeaderProps {
    breadcrumbs?: React.ReactNode;
    actions?: React.ReactNode;
}

export async function Header({ breadcrumbs, actions }: HeaderProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-8 sticky top-0 z-30 shrink-0">
            {/* Left side: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted">
                {breadcrumbs}
            </div>

            {/* Right side: Actions, Theme Toggle, Notifications */}
            <div className="flex items-center gap-4">
                {actions && (
                    <div className="flex items-center mr-2">
                        {actions}
                    </div>
                )}

                {/* Separator if there are actions */}
                {actions && <div className="h-6 w-px bg-border hidden sm:block" />}

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user && <NotificationBell userId={user.id} />}
                </div>
            </div>
        </header>
    );
}
