-- ==========================================
-- DEFINITIVE FIX FOR INFINITE RECURSION (Error 42P17)
-- ==========================================

-- Problem: The `workspaces` SELECT policy queries `workspace_members`, and 
-- `workspace_members` policies query `workspaces`. This creates a cyclic dependency loop.
-- Solution: We use `SECURITY DEFINER` functions to perform these lookups. Because they run 
-- with elevated privileges, they bypass RLS, breaking the recursion loop.

-- 1. Function to get all workspace IDs where the current user is a member
CREATE OR REPLACE FUNCTION public.get_user_workspaces()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
$$;

-- 2. Function to get all workspace IDs that the current user owns
CREATE OR REPLACE FUNCTION public.get_owned_workspaces()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM workspaces WHERE owner_id = auth.uid();
$$;

-- 3. Drop existing recursive policies
DROP POLICY IF EXISTS "Workspace members can view workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace members can view members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owner can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owner can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owner can update roles" ON public.workspace_members;

-- 4. Create non-recursive policies for `workspaces`
CREATE POLICY "Workspace members can view workspace"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT public.get_user_workspaces())
    OR owner_id = auth.uid()
  );

-- 5. Create non-recursive policies for `workspace_members`
CREATE POLICY "Workspace members can view members"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (SELECT public.get_user_workspaces())
  );

CREATE POLICY "Workspace owner can add members"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (SELECT public.get_owned_workspaces())
    OR (user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Workspace owner can update roles"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (SELECT public.get_owned_workspaces())
  );

CREATE POLICY "Workspace owner can remove members"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (SELECT public.get_owned_workspaces())
  );
