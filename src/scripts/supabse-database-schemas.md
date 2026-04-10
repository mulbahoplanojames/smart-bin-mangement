# Smart Waste Management Dashboard - Database Setup

Copy and paste the following SQL commands into your Supabase **SQL Editor** to create the tables, relationships, and basic Row Level Security (RLS) policies.

## 1. Create Tables

This section creates the required tables based on your schema expectations.

```sql
-- Enable UUID extension just in case it's not enabled by default
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum type for user roles to ensure consistency
CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'driver');

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
-- We link this table to the Supabase auth.users table via trigger below.
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. BINS TABLE
-- ==========================================
CREATE TABLE public.bins (
  id TEXT PRIMARY KEY, -- E.g., 'BIN-001'
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  "fillLevel" INTEGER DEFAULT 0 CHECK ("fillLevel" >= 0 AND "fillLevel" <= 100),
  status TEXT CHECK (status IN ('Empty', 'Medium', 'Full', 'Overflow', 'Offline')) DEFAULT 'Empty',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. COLLECTIONS TABLE
-- ==========================================
CREATE TABLE public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "driverId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  "wasteCollected" DOUBLE PRECISION DEFAULT 0.0,
  status TEXT CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Pending',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. ALERTS TABLE
-- ==========================================
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT CHECK (type IN ('Bin Overflow', 'Sensor Offline', 'Collection Delay', 'Other')) NOT NULL,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
  "binId" TEXT REFERENCES public.bins(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Active', 'Acknowledged', 'Resolved')) DEFAULT 'Active',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 2. Supabase Auth Trigger

This trigger automatically creates a user in `public.users` whenever a new user signs up in `auth.users` via Supabase authentication.

```sql
-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    CAST(COALESCE(new.raw_user_meta_data->>'role', 'staff') AS public.user_role) -- Cast to enum type
  );
  RETURN new;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 3. Enable Row-Level Security (RLS)

The following script enables RLS on all tables and creates standard access policies based on roles.

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR 'users'
-- ==========================================
-- Everyone can read users (for dashboard display purposes)
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
-- Only users themselves or admins can update their profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- RLS POLICIES FOR 'bins'
-- ==========================================
-- Everyone can view bins
CREATE POLICY "Bins are viewable by everyone" ON public.bins FOR SELECT USING (true);
-- Only admins can insert or delete bins
CREATE POLICY "Only admins can insert bins" ON public.bins FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete bins" ON public.bins FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
-- Admins and IoT API (service role) can update bins. Assuming authenticated users can update (or API routes bypass RLS).
CREATE POLICY "Authenticated users can update bins" ON public.bins FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- RLS POLICIES FOR 'collections'
-- ==========================================
CREATE POLICY "Collections are viewable by authenticated users" ON public.collections FOR SELECT USING (auth.role() = 'authenticated');
-- Only admins can assign collections
CREATE POLICY "Only admins can insert collections" ON public.collections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
-- Drivers can update their own collections (e.g., mark as Completed), Admins can update all.
CREATE POLICY "Drivers can update own collections, admins can update all" ON public.collections FOR UPDATE USING (
  "driverId" = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- RLS POLICIES FOR 'alerts'
-- ==========================================
CREATE POLICY "Alerts are viewable by authenticated users" ON public.alerts FOR SELECT USING (auth.role() = 'authenticated');
-- Any authenticated user (or IoT handler) can insert alerts
CREATE POLICY "Authenticated users can insert alerts" ON public.alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Staff and Admins can update alerts (e.g., acknowledge them)
CREATE POLICY "Staff and Admins can update alerts" ON public.alerts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
```

## 4. Setting up Realtime subscriptions (Optional but recommended for IoT)

To allow Next.js to listen to real-time changes (e.g. changing bin colors instantly on the map).

```sql
-- Enable real-time for bins and alerts
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
```

<!-- -- 1) Drop the dependent trigger on auth.users -->

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

<!-- -- 2) Drop the function (now no dependencie  s remain) -->

DROP FUNCTION IF EXISTS handle_new_user();
