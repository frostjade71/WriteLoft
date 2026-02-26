"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getNotes(workspaceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data, error } = await supabase
        .from("notes")
        .select(
            `
      id,
      title,
      updated_at,
      author:users!notes_updated_by_fkey(name, email)
    `
        )
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching notes:", error);
        return [];
    }

    return data || [];
}

export async function createNote(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const workspaceId = formData.get("workspaceId") as string;
    const title = (formData.get("title") as string) || "Untitled Note";

    if (!workspaceId) return;

    const { data: note, error } = await supabase
        .from("notes")
        .insert({
            workspace_id: workspaceId,
            title: title.trim(),
            created_by: user.id,
            updated_by: user.id,
            content: { type: "doc", content: [{ type: "paragraph" }] },
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating note:", error);
        return;
    }

    revalidatePath(`/workspace/${workspaceId}`);
    redirect(`/workspace/${workspaceId}/note/${note.id}`);
}

export async function deleteNote(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const noteId = formData.get("noteId") as string;
    const workspaceId = formData.get("workspaceId") as string;

    // RLS will block if the user isn't an owner/editor of the workspace
    const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

    if (error) {
        console.error("Error deleting note:", error);
        return;
    }

    revalidatePath(`/workspace/${workspaceId}`);
    redirect(`/workspace/${workspaceId}`);
}

export async function getNoteById(noteId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: note, error } = await supabase
        .from("notes")
        .select(
            `
      *,
      workspace:workspaces(name, workspace_members(role, user:users(id, name, email, avatar_url))),
      author:users!notes_updated_by_fkey(name, email)
    `
        )
        .eq("id", noteId)
        .maybeSingle();

    if (error || !note) {
        if (error) console.error("Error fetching note:", error);
        return null;
    }

    return { note, currentUserId: user.id };
}

// Called implicitly by the client to persist Yjs documents during auto-save
export async function updateNoteContent(noteId: string, content: any, title?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const updates: any = {
        content,
        updated_by: user.id,
    };

    if (title) {
        updates.title = title;
    }

    const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", noteId);

    if (error) {
        console.error("Error updating note:", error);
        return { error: error.message };
    }

    return { success: true };
}

export async function getCommentsByNoteId(noteId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data, error } = await supabase
        .from("comments")
        .select(`
            id, 
            body, 
            created_at, 
            user:users!comments_user_id_fkey(id, name, avatar_url)
        `)
        .eq("note_id", noteId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }

    // Format relational data
    return (data || []).map((comment: any) => ({
        ...comment,
        user: Array.isArray(comment.user) ? comment.user[0] : comment.user
    }));
}

export async function inviteMember(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const workspaceId = formData.get("workspaceId") as string;
    const email = formData.get("email") as string;
    const role = (formData.get("role") as string) || "editor";

    if (!workspaceId || !email) {
        return { error: "Missing required fields" };
    }

    // 1. Find user by email in the public.users table 
    //    (Assumes public.users mirrors auth.users emails)
    const { data: invitee, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .single();

    if (userError || !invitee) {
        return { error: "User with this email not found" };
    }

    // 2. Add to workspace_members
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
            workspace_id: workspaceId,
            user_id: invitee.id,
            role,
        });

    if (memberError) {
        console.error("Error inserting member:", memberError);
        return { error: memberError.message || "User is already a member or could not be added." };
    }

    // 3. Notify the user they were invited
    await supabase.from("notifications").insert({
        user_id: invitee.id,
        type: "invite",
        ref_id: workspaceId,
        is_read: false
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
}

export async function removeMember(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const workspaceId = formData.get("workspaceId") as string;
    const userIdToRemove = formData.get("userId") as string;

    if (!workspaceId || !userIdToRemove) {
        throw new Error("Missing required fields");
    }

    // Rely on RLS to prevent non-owners from deleting members
    // RLS policy: "Workspace owner can remove members"
    const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("user_id", userIdToRemove);

    if (error) {
        console.error("Error removing member:", error);
        throw new Error("Could not remove member. You might not have permission.");
    }

    revalidatePath(`/workspace/${workspaceId}`);
}
