create table public.chat_message (
  id integer generated always as identity primary key,
  chat_session_id uuid not null,
  sender text not null,
  text text not null,
  score numeric,
  timestamp timestamptz not null default now()
);
comment on table public.chat_message is 'Stores chat messages for chat sessions, including the sender type (user or ai), the message text, an optional confidence score, and a timestamp.';

create table public.listing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  images text[] not null,
  species text not null,
  price numeric(10,2) not null,
  care_details text not null,
  care_tips text[] null,
  tags text[],
  light_level text null, -- Describes the light requirement for the plant, e.g., Low, Medium, High.
  size text null, -- Describes the general size of the plant, e.g., 1 (Small), 2 (Medium), 3 (Large).
  watering_frequency text null, -- Describes how often the plant needs watering, e.g., Daily, Weekly, Monthly.
  user_id uuid not null default next_auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.listing is 'Stores seller listings with details such as plant images, species, pricing, care instructions, and optional tags. Each listing is owned by a seller identified by user_id.';
alter table public.listing enable row level security;
create policy "Select listing policy" on public.listing as permissive for select using (next_auth.uid() = user_id);
create policy "Insert listing policy" on public.listing as permissive for insert with check (next_auth.uid() = user_id);
create policy "Update listing policy" on public.listing as permissive for update using (next_auth.uid() = user_id);
create policy "Delete listing policy" on public.listing as permissive for delete using (next_auth.uid() = user_id);

create table public.cart_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.listing(id),
  quantity integer not null,
  price numeric(10,2) not null,
  user_id uuid not null default next_auth.uid()
);
comment on table public.cart_item is 'Stores items added to the cart by buyers, referencing a listing via product_id and capturing the quantity and price at the time of addition.';
alter table public.cart_item enable row level security;
create policy "Select cart_item policy" on public.cart_item as permissive for select using (next_auth.uid() = user_id);
create policy "Insert cart_item policy" on public.cart_item as permissive for insert with check (next_auth.uid() = user_id);
create policy "Update cart_item policy" on public.cart_item as permissive for update using (next_auth.uid() = user_id);
create policy "Delete cart_item policy" on public.cart_item as permissive for delete using (next_auth.uid() = user_id);

create table public.favorite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.listing(id),
  user_id uuid not null default next_auth.uid()
);
comment on table public.favorite is 'Stores products favorited by buyers for future purchase, with product_id referencing a listing.';
alter table public.favorite enable row level security;
create policy "Select favorite policy" on public.favorite as permissive for select using (next_auth.uid() = user_id);
create policy "Insert favorite policy" on public.favorite as permissive for insert with check (next_auth.uid() = user_id);
create policy "Delete favorite policy" on public.favorite as permissive for delete using (next_auth.uid() = user_id);

-- Table for care tasks associated with a purchased listing
CREATE TABLE care_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES next_auth.users(id) NOT NULL,
    listing_id UUID REFERENCES listing(id) NOT NULL,
    title TEXT, -- A short, fun title for the task (e.g., "Time for a drink!")
    task_description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE, -- To distinguish between essential tasks and optional suggestions
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Note (YYYY-MM-DD): The 'completed_at' column was added manually via the SQL below to fix a bug.
-- ALTER TABLE public.care_task ADD COLUMN completed_at TIMESTAMPTZ;

-- Note (2024-08-05): The 'title' and 'is_optional' columns were added to support a more user-friendly
-- and intelligent care calendar experience. This was done via the following ALTER statement after initial table creation.
-- ALTER TABLE public.care_task
-- ADD COLUMN title TEXT,
-- ADD COLUMN is_optional BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Add an index for faster querying by user_id and due_date
CREATE INDEX idx_care_task_user_due_date ON care_task(user_id, due_date);

-- RLS Policies for care_task table
ALTER TABLE care_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own care tasks"
ON care_task
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care tasks"
ON care_task
FOR INSERT
WITH CHECK (auth.uid() = user_id); -- This might be too restrictive if tasks are created by the system/webhook

CREATE POLICY "Users can update their own care tasks (e.g., mark as complete)"
ON care_task
FOR UPDATE
USING (auth.uid() = user_id);

-- Consider if a delete policy is needed, or if tasks are soft-deleted/archived.
-- CREATE POLICY "Users can delete their own care tasks"
-- ON care_task
-- FOR DELETE
-- USING (auth.uid() = user_id);

-- Adjust INSERT policy if webhooks/system needs to insert tasks.
-- A more permissive insert policy might be needed, or use a service role key for inserts from webhooks.
-- For system-generated tasks (via webhook), we will use the service role key, so RLS for INSERT by user isn't strictly necessary
-- for that pathway. However, if users could manually add tasks later, it would be relevant.
-- For now, let's refine the insert policy to be less restrictive if we anticipate system-level inserts
-- For now, we'll rely on the service role for insertions from the webhook.
-- Let's remove the user-specific insert policy and rely on service role for now for insertions.
DROP POLICY IF EXISTS "Users can insert their own care tasks" ON care_task;

-- We'll handle inserts via the webhook using the admin client, which bypasses RLS.
-- Users will primarily interact via SELECT and UPDATE (marking complete).

create table public.search_preference (
  id integer generated always as identity primary key,
  light_level text,
  size text,
  watering_frequency text,
  user_id uuid not null default next_auth.uid()
);
comment on table public.search_preference is 'Stores search preferences for product discovery, including attributes such as light level, plant size, and watering frequency. Each preference is linked to the user.';
alter table public.search_preference enable row level security;
create policy "Select search_preference policy" on public.search_preference as permissive for select using (next_auth.uid() = user_id);
create policy "Insert search_preference policy" on public.search_preference as permissive for insert with check (next_auth.uid() = user_id);
create policy "Update search_preference policy" on public.search_preference as permissive for update using (next_auth.uid() = user_id);
create policy "Delete search_preference policy" on public.search_preference as permissive for delete using (next_auth.uid() = user_id);

-- SQL Function to get the application-specific user ID from the JWT's sub claim
CREATE OR REPLACE FUNCTION requesting_app_user_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT (auth.jwt()->>'sub')::uuid;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION requesting_app_user_id IS 'Retrieves the user ID (from next_auth.users) from the ''sub'' claim of the current JWT. Used for RLS.';

-- RLS Policies for listing table
ALTER TABLE public.listing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Select listing policy" ON public.listing;
CREATE POLICY "Authenticated users can view all listings"
ON public.listing
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Insert listing policy" ON public.listing;
CREATE POLICY "Insert listing policy" ON public.listing AS PERMISSIVE FOR INSERT WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Update listing policy" ON public.listing;
CREATE POLICY "Update listing policy" ON public.listing AS PERMISSIVE FOR UPDATE USING (requesting_app_user_id() = user_id) WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Delete listing policy" ON public.listing;
CREATE POLICY "Delete listing policy" ON public.listing AS PERMISSIVE FOR DELETE USING (requesting_app_user_id() = user_id);

-- RLS Policies for cart_item table
ALTER TABLE public.cart_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Select cart_item policy" ON public.cart_item;
CREATE POLICY "Select cart_item policy" ON public.cart_item AS PERMISSIVE FOR SELECT USING (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Insert cart_item policy" ON public.cart_item;
CREATE POLICY "Insert cart_item policy" ON public.cart_item AS PERMISSIVE FOR INSERT WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Update cart_item policy" ON public.cart_item;
CREATE POLICY "Update cart_item policy" ON public.cart_item AS PERMISSIVE FOR UPDATE USING (requesting_app_user_id() = user_id) WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Delete cart_item policy" ON public.cart_item;
CREATE POLICY "Delete cart_item policy" ON public.cart_item AS PERMISSIVE FOR DELETE USING (requesting_app_user_id() = user_id);

-- RLS Policies for favorite table
ALTER TABLE public.favorite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Select favorite policy" ON public.favorite;
CREATE POLICY "Select favorite policy" ON public.favorite AS PERMISSIVE FOR SELECT USING (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Insert favorite policy" ON public.favorite;
CREATE POLICY "Insert favorite policy" ON public.favorite AS PERMISSIVE FOR INSERT WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Delete favorite policy" ON public.favorite;
CREATE POLICY "Delete favorite policy" ON public.favorite AS PERMISSIVE FOR DELETE USING (requesting_app_user_id() = user_id);

-- RLS Policies for care_task table
ALTER TABLE care_task ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care tasks" ON care_task;
CREATE POLICY "Users can view their own care tasks" ON care_task FOR SELECT USING (requesting_app_user_id() = user_id);
-- Note: INSERT for care_task is typically handled by webhook with service role.
-- If users can manually add tasks, an INSERT policy would be:
-- DROP POLICY IF EXISTS "Users can insert their own care tasks" ON care_task;
-- CREATE POLICY "Users can insert their own care tasks" ON care_task FOR INSERT WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Users can update their own care tasks (e.g., mark as complete)" ON care_task;
CREATE POLICY "Users can update their own care tasks (e.g., mark as complete)" ON care_task FOR UPDATE USING (requesting_app_user_id() = user_id) WITH CHECK (requesting_app_user_id() = user_id);
-- DROP POLICY IF EXISTS "Users can delete their own care tasks" ON care_task; -- If needed

-- RLS Policies for search_preference table
ALTER TABLE public.search_preference ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Select search_preference policy" ON public.search_preference;
CREATE POLICY "Select search_preference policy" ON public.search_preference AS PERMISSIVE FOR SELECT USING (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Insert search_preference policy" ON public.search_preference;
CREATE POLICY "Insert search_preference policy" ON public.search_preference AS PERMISSIVE FOR INSERT WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Update search_preference policy" ON public.search_preference;
CREATE POLICY "Update search_preference policy" ON public.search_preference AS PERMISSIVE FOR UPDATE USING (requesting_app_user_id() = user_id) WITH CHECK (requesting_app_user_id() = user_id);
DROP POLICY IF EXISTS "Delete search_preference policy" ON public.search_preference;
CREATE POLICY "Delete search_preference policy" ON public.search_preference AS PERMISSIVE FOR DELETE USING (requesting_app_user_id() = user_id);