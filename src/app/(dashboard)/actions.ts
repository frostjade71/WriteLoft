"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getWorkspaces() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data, error } = await supabase
        .from("workspaces")
        .select(
            `
      *,
      workspace_members!inner(role),
      owner:users!workspaces_owner_id_fkey(name, email)
    `
        )
        .eq("workspace_members.user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching workspaces:", error);
        return [];
    }

    return data || [];
}

export async function createWorkspace(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return;
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name: name.trim(), owner_id: user.id })
        .select()
        .single();

    if (workspaceError) {
        console.error("Error creating workspace:", workspaceError);
        return;
    }

    // Add creator as owner member
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "owner",
        });

    if (memberError) {
        console.error("Error adding owner as member:", memberError);
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function getWorkspaceById(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: workspace, error } = await supabase
        .from("workspaces")
        .select(
            `
      *,
      owner:users!workspaces_owner_id_fkey(name, email),
      workspace_members(
        role,
        user:users(id, name, email, avatar_url)
      )
    `
        )
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching workspace:", error);
        return null;
    }

    return { workspace, currentUserId: user.id };
}

export async function deleteWorkspace(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const workspaceId = formData.get("workspaceId") as string;

    const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId)
        .eq("owner_id", user.id); // RLS also enforces this

    if (error) {
        console.error("Error deleting workspace:", error);
        return;
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}
