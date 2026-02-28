import { Header } from "@/components/layout/Header";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { CatLoader } from "@/components/ui/CatLoader";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <Header breadcrumbs={<span className="text-foreground">Workspaces</span>} mobileMenuButton={<MobileMenuButton />} />

            <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
                <CatLoader />
            </div>
        </div>
    );
}

