import { Header } from "@/components/layout/Header";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";

export default function WorkspaceLoading() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <Header breadcrumbs={
                <>
                    <div className="h-4 w-20 bg-surface rounded"></div>
                    <span>/</span>
                    <div className="h-4 w-32 bg-surface rounded"></div>
                </>
            } mobileMenuButton={<MobileMenuButton />} />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="h-8 w-64 bg-surface rounded-lg mb-2"></div>
                        <div className="h-4 w-48 bg-surface rounded"></div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Area Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="h-7 w-20 bg-surface rounded-lg"></div>
                            <div className="h-9 w-28 bg-primary/50 rounded-lg"></div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-xl border border-border bg-surface p-5 h-[140px]">
                                    <div className="h-5 w-40 bg-surface-hover rounded mb-3"></div>
                                    <div className="h-3 w-32 bg-surface-hover rounded mb-1"></div>
                                    <div className="h-3 w-24 bg-surface-hover rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div>
                        <div className="rounded-xl border border-border bg-surface flex flex-col h-[400px]">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div>
                                    <div className="h-6 w-24 bg-surface-hover rounded mb-1"></div>
                                    <div className="h-4 w-16 bg-surface-hover rounded"></div>
                                </div>
                                <div className="h-8 w-24 bg-surface-hover rounded-lg"></div>
                            </div>
                            <div className="p-5 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-surface-hover"></div>
                                            <div>
                                                <div className="h-4 w-24 bg-surface-hover rounded mb-1"></div>
                                                <div className="h-3 w-32 bg-surface-hover rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-4 w-12 bg-surface-hover rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
