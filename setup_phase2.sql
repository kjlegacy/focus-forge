-- Focus Forge: Phase 2 Database Setup
-- Run this in your Supabase SQL Editor to prepare for Phase 2.

-- 1. Add Active Task Column to Weapons
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='weapons' AND column_name='active_task') THEN
        ALTER TABLE public.weapons ADD COLUMN active_task TEXT DEFAULT 'Unknown Task';
    END IF;
END
$$;
