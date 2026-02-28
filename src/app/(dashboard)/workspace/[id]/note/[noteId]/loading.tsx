import { Header } from "@/components/layout/Header";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";

export default function NoteLoading() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <Header
                breadcrumbs={
                    <>
                        <div className="h-4 w-20 bg-surface rounded"></div>
                        <span>/</span>
                        <div className="h-4 w-32 bg-surface rounded"></div>
                        <span>/</span>
                        <div className="h-4 w-40 bg-surface rounded"></div>
                    </>
                }
                mobileMenuButton={<MobileMenuButton />}
            />

            {/* Main Content Area Skeleton */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Area Skeleton */}
                <div className="flex-1 overflow-hidden relative p-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Title Skeleton */}
                        <div className="h-12 w-3/4 bg-surface rounded-lg mb-8"></div>

                        {/* Content Skeleton */}
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-surface rounded"></div>
                            <div className="h-4 w-11/12 bg-surface rounded"></div>
                            <div className="h-4 w-4/5 bg-surface rounded"></div>
                            <div className="h-4 w-full bg-surface rounded"></div>
                            <div className="h-4 w-3/4 bg-surface rounded"></div>
                            <div className="h-4 w-full bg-surface rounded mt-8"></div>
                            <div className="h-4 w-5/6 bg-surface rounded"></div>
                            <div className="h-4 w-1/2 bg-surface rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Comments Sidebar Skeleton */}
                <div className="w-80 flex-shrink-0 border-l border-border bg-surface flex flex-col h-full"></div>
            </div>
        </div>
    );
}
