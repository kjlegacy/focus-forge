-- Focus Forge: Phase 1 Database Setup
-- Run this in your Supabase SQL Editor to prepare for Phase 1.

-- 1. Add Faction Column to Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='faction') THEN
        ALTER TABLE public.profiles ADD COLUMN faction TEXT;
    END IF;
END
$$;

-- 2. Add Total Focus Minutes & Item Icon to Profiles/Weapons
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='total_focus_minutes') THEN
        ALTER TABLE public.profiles ADD COLUMN total_focus_minutes BIGINT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='weapons' AND column_name='item_icon') THEN
        ALTER TABLE public.weapons ADD COLUMN item_icon TEXT;
    END IF;
END
$$;

-- 3. Create Ore Types Table
CREATE TABLE IF NOT EXISTS public.ore_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    tier INTEGER NOT NULL,
    buy_price INTEGER NOT NULL
);

-- Note: We assume ID 1 will be Copper Ore based on this insert sequence.
INSERT INTO public.ore_types (name, tier, buy_price)
VALUES 
    ('Copper Ore', 1, 10),
    ('Iron Ore', 2, 50),
    ('Steel Ore', 3, 150),
    ('Mithril Ore', 4, 500)
ON CONFLICT (name) DO NOTHING;

-- 3. Create User Resources Table
CREATE TABLE IF NOT EXISTS public.user_resources (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ore_id INTEGER REFERENCES public.ore_types(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, ore_id)
);

-- 4. Set up RLS for User Resources
ALTER TABLE public.user_resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_resources' AND policyname = 'Users can view own resources'
    ) THEN
        CREATE POLICY "Users can view own resources" 
        ON public.user_resources FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_resources' AND policyname = 'Users can insert own resources'
    ) THEN
        CREATE POLICY "Users can insert own resources" 
        ON public.user_resources FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_resources' AND policyname = 'Users can update own resources'
    ) THEN
        CREATE POLICY "Users can update own resources" 
        ON public.user_resources FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;
