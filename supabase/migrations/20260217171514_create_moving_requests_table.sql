/*
  # Create moving requests table

  1. New Tables
    - `moving_requests`
      - `id` (uuid, primary key)
      - `move_type` (text) - 'in_state' or 'out_of_state'
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `current_address` (text)
      - `destination_address` (text)
      - `move_date` (date)
      - `home_size` (text) - e.g., 'studio', '1_bedroom', '2_bedroom', etc.
      - `additional_notes` (text)
      - `status` (text) - 'pending', 'contacted', 'completed'
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `moving_requests` table
    - Add policy for public to insert their own requests
    - Add policy for authenticated users to view all requests (for admin)
*/

CREATE TABLE IF NOT EXISTS moving_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  move_type text NOT NULL CHECK (move_type IN ('in_state', 'out_of_state')),
  name text,
  email text,
  phone text,
  current_address text,
  destination_address text,
  move_date date,
  home_size text,
  additional_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE moving_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit moving requests"
  ON moving_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all requests"
  ON moving_requests
  FOR SELECT
  TO authenticated
  USING (true);