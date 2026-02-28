"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateWorkspaceName(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const workspaceId = formData.get("workspaceId") as string;
    const name = formData.get("name") as string;

    if (!workspaceId || !name || name.trim().length === 0) {
        return { error: "Invalid name" };
    }

    const { error } = await supabase
        .from("workspaces")
        .update({ name: name.trim() })
        .eq("id", workspaceId)
        .eq("owner_id", user.id); // RLS also enforces this

    if (error) {
        console.error("Error updating workspace:", error);
        return { error: error.message };
    }

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
}
