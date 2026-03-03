/*
  # Fix RLS Policy Security Issue

  1. Changes
    - Drop the insecure "Anyone can submit moving requests" policy that had WITH CHECK (true)
    - Create a new policy with proper validation to prevent abuse
    - Ensure only legitimate moving requests with required fields can be inserted
  
  2. Security
    - New policy validates that required fields are provided
    - Prevents empty or malicious submissions
    - Rate limiting should be handled at the application/edge function level
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can submit moving requests" ON moving_requests;

-- Create a new secure policy that validates required fields
CREATE POLICY "Public can submit valid moving requests"
  ON moving_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Ensure move_type is provided and valid (already enforced by CHECK constraint)
    move_type IS NOT NULL
    -- Ensure at least basic contact information is provided
    AND (
      (email IS NOT NULL AND email != '' AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
      OR (phone IS NOT NULL AND phone != '' AND LENGTH(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10)
    )
    -- Ensure addresses are provided
    AND current_address IS NOT NULL 
    AND current_address != ''
    AND destination_address IS NOT NULL 
    AND destination_address != ''
    -- Ensure move date and home size are provided
    AND move_date IS NOT NULL
    AND home_size IS NOT NULL
    AND home_size != ''
  );