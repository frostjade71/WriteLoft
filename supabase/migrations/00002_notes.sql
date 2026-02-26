-- ============================================
-- WriteLoft — Notes Schema Migration
-- ============================================

-- Notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'Untitled Note',
  content JSONB DEFAULT '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Note versions (for future Phase 4, but creating table now)
CREATE TABLE public.note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  content_snapshot JSONB NOT NULL,
  saved_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR NOTES
-- ============================================

-- Notes: Workspace members can view notes
CREATE POLICY "Workspace members can view notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = notes.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Notes: Editors and Owners can create notes
CREATE POLICY "Editors and owners can create notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'editor')
    )
  );

-- Notes: Editors and Owners can update notes
CREATE POLICY "Editors and owners can update notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = notes.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'editor')
    )
  );

-- Notes: Editors and Owners can delete notes
CREATE POLICY "Editors and owners can delete notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = notes.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'editor')
    )
  );

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_note_updated
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SUPABASE REALTIME CONFIGURATION
-- ============================================
-- Enable replication for notes table so changes broadcast to clients
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
