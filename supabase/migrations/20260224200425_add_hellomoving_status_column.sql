/*
  # Add HelloMoving status tracking column

  1. Modified Tables
    - `moving_requests`
      - Added `hellomoving_status` (text) - Tracks whether the lead was successfully sent to HelloMoving API
        - 'pending' = not yet attempted
        - 'sent' = successfully delivered to HelloMoving
        - 'failed' = delivery to HelloMoving failed (data preserved in Supabase as backup)

  2. Notes
    - Default value is 'pending' so existing rows get a sensible status
    - This column enables monitoring of HelloMoving API reliability
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moving_requests' AND column_name = 'hellomoving_status'
  ) THEN
    ALTER TABLE moving_requests ADD COLUMN hellomoving_status text DEFAULT 'pending';
  END IF;
END $$;
