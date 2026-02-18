-- FIX: Drop the old problematic RLS policy and create a new one
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/sql/new

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow users to check own admin status" ON admins;
DROP POLICY IF EXISTS "Allow admin read on admins" ON admins;

-- Create the new permissive policy
CREATE POLICY "Allow authenticated to check admin status" 
  ON admins FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Verify the policy is in place
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'admins';
