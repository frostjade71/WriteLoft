-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In a real app we'd probably want to store the comment's position in the document
-- For this version, we'll keep it simple and just associate comments with the note as a whole

-- Create notifications table
CREATE TYPE notification_type AS ENUM ('mention', 'invite', 'delete');

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    ref_id UUID NOT NULL, -- Reference to the comment_id, workspace_id, or note_id
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Comments Policies
-- Users can view comments on notes in workspaces they are members of
CREATE POLICY "Users can view comments on accessible notes" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes n
            JOIN public.workspace_members wm ON n.workspace_id = wm.workspace_id
            WHERE n.id = comments.note_id AND wm.user_id = auth.uid()
        )
    );

-- Owners and editors can create comments
CREATE POLICY "Editors and owners can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes n
            JOIN public.workspace_members wm ON n.workspace_id = wm.workspace_id
            WHERE n.id = comments.note_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'editor')
        )
    );

-- Users can delete their own comments, or workspace owners can delete any
CREATE POLICY "Users can delete own comments, owners can delete any" ON public.comments
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.notes n
            JOIN public.workspace_members wm ON n.workspace_id = wm.workspace_id
            WHERE n.id = comments.note_id
              AND wm.user_id = auth.uid()
              AND wm.role = 'owner'
        )
    );

-- Notifications Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Triggers or edge functions would handle INSERTs for notifications securely, 
-- but we'll allow inserts from authenticated users for now if they are creating a mention
CREATE POLICY "Authenticated users can create notifications (for mentions)" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());
    
-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_comments_note_id ON public.comments(note_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
