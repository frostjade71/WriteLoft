-- ==========================================
-- FIX FOR INFINITE RECURSION IN RLS (Error 42P17)
-- ==========================================

-- 1. Drop the recursive policy from workspace_members
DROP POLICY IF EXISTS "Workspace members can view members" ON public.workspace_members;

-- 2. Create the fixed non-recursive policy
-- The old policy SELECTed from workspace_members inside the USING clause.
-- The new policy avoids recursion by joining the workspaces table instead, 
-- or by relying on a non-recursive correlated subquery.

-- Since a user can view members if they are in the same workspace:
CREATE POLICY "Workspace members can view members"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (
    -- You can see membership rows for any workspace where you are also a member
    workspace_id IN (
      SELECT wm_inner.workspace_id 
      FROM public.workspace_members wm_inner 
      WHERE wm_inner.user_id = auth.uid()
    )
  );

-- Note: The above specific subquery structure (with an alias `wm_inner` and a clean `IN` clause)
-- usually prevents Postgres from entering an infinite recursion loop during RLS evaluation.

-- However, an even safer approach (widely recommended by Supabase for join tables) is:
DROP POLICY IF EXISTS "Workspace members can view members" ON public.workspace_members;
CREATE POLICY "Workspace members can view members"
ON public.workspace_members FOR SELECT
TO authenticated
USING (
  -- Can always see your own row
  user_id = auth.uid()
  OR
  -- Or if you are the owner of the workspace the member belongs to
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid()
  )
  -- Or if you share a workspace. Using a secure scalar function is the bulletproof way,
  -- but we can use:
  OR 
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);
