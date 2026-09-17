-- Create the saved_accounts table
CREATE TABLE IF NOT EXISTS public.saved_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game VARCHAR(255) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    player_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.saved_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved accounts" ON public.saved_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved accounts" ON public.saved_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved accounts" ON public.saved_accounts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved accounts" ON public.saved_accounts
    FOR UPDATE USING (auth.uid() = user_id);
