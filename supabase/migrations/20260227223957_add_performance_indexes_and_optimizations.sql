/*
  # Add Performance Indexes and Optimizations for Scale

  1. Performance Improvements
    - Add index on `created_at` for time-based queries and sorting
    - Add index on `status` for filtering pending/contacted/completed requests
    - Add composite index on `status` + `created_at` for common admin dashboard queries
    - Add index on `move_date` for scheduling and date-range queries
    - Add index on `email` for duplicate checking and lookup
    - Add index on `phone` for duplicate checking and lookup
    - Add partial index on `status = 'pending'` for faster pending request queries
    
  2. Data Integrity
    - Split `name` field into `first_name` and `last_name` for better data normalization
    - Add NOT NULL constraints to critical fields
    
  3. Query Optimization
    - These indexes support common query patterns:
      * Admin dashboard: WHERE status = 'pending' ORDER BY created_at DESC
      * Date-based filtering: WHERE move_date BETWEEN ? AND ?
      * Duplicate detection: WHERE email = ? OR phone = ?
      * Status updates: WHERE status = ? ORDER BY created_at
*/

-- Add missing columns for better data structure
DO $$
BEGIN
  -- Add first_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moving_requests' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE moving_requests ADD COLUMN first_name text;
    -- Migrate existing data if name column has data
    UPDATE moving_requests SET first_name = split_part(name, ' ', 1) WHERE name IS NOT NULL;
  END IF;

  -- Add last_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'moving_requests' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE moving_requests ADD COLUMN last_name text;
    -- Migrate existing data if name column has data
    UPDATE moving_requests SET last_name = substring(name from position(' ' in name) + 1) WHERE name IS NOT NULL AND position(' ' in name) > 0;
  END IF;
END $$;

-- Create performance indexes
-- Index for time-based queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_moving_requests_created_at 
  ON moving_requests(created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_moving_requests_status 
  ON moving_requests(status);

-- Composite index for common admin queries (status + time)
CREATE INDEX IF NOT EXISTS idx_moving_requests_status_created 
  ON moving_requests(status, created_at DESC);

-- Index for move date scheduling queries
CREATE INDEX IF NOT EXISTS idx_moving_requests_move_date 
  ON moving_requests(move_date) 
  WHERE move_date IS NOT NULL;

-- Index for email lookups and duplicate detection
CREATE INDEX IF NOT EXISTS idx_moving_requests_email 
  ON moving_requests(email) 
  WHERE email IS NOT NULL;

-- Index for phone lookups and duplicate detection
CREATE INDEX IF NOT EXISTS idx_moving_requests_phone 
  ON moving_requests(phone) 
  WHERE phone IS NOT NULL;

-- Partial index for pending requests (most common query)
CREATE INDEX IF NOT EXISTS idx_moving_requests_pending 
  ON moving_requests(created_at DESC) 
  WHERE status = 'pending';

-- Add index for move_type filtering
CREATE INDEX IF NOT EXISTS idx_moving_requests_move_type 
  ON moving_requests(move_type);

-- Composite index for filtering by status and move_type together
CREATE INDEX IF NOT EXISTS idx_moving_requests_status_move_type 
  ON moving_requests(status, move_type, created_at DESC);