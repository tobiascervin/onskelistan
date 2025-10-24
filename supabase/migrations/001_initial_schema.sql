-- Gift Share Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sublists table (persons/categories)
CREATE TABLE IF NOT EXISTS sublists (
    id BIGSERIAL PRIMARY KEY,
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items table (individual wishes)
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    sublist_id BIGINT NOT NULL REFERENCES sublists(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    claimed_by TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sublists_wishlist_id ON sublists(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_sublists_order ON sublists("order");
CREATE INDEX IF NOT EXISTS idx_items_sublist_id ON items(sublist_id);
CREATE INDEX IF NOT EXISTS idx_items_order ON items("order");

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on wishlists
CREATE TRIGGER update_wishlists_updated_at
    BEFORE UPDATE ON wishlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Since this is a public wishlist app without auth, we allow all operations

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access on wishlists"
    ON wishlists FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on sublists"
    ON sublists FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on items"
    ON items FOR SELECT
    USING (true);

-- Allow public insert on all tables
CREATE POLICY "Allow public insert on wishlists"
    ON wishlists FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public insert on sublists"
    ON sublists FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public insert on items"
    ON items FOR INSERT
    WITH CHECK (true);

-- Allow public update on all tables
CREATE POLICY "Allow public update on wishlists"
    ON wishlists FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public update on sublists"
    ON sublists FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public update on items"
    ON items FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow public delete on all tables
CREATE POLICY "Allow public delete on wishlists"
    ON wishlists FOR DELETE
    USING (true);

CREATE POLICY "Allow public delete on sublists"
    ON sublists FOR DELETE
    USING (true);

CREATE POLICY "Allow public delete on items"
    ON items FOR DELETE
    USING (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE wishlists;
ALTER PUBLICATION supabase_realtime ADD TABLE sublists;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
