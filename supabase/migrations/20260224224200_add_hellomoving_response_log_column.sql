/*
  # Add HelloMoving API response log column

  1. Modified Tables
    - `moving_requests`
      - `hellomoving_response` (text) - Stores the raw response body from the HelloMoving API for debugging

  2. Important Notes
    - This column captures the full API response to help diagnose lead delivery issues
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moving_requests' AND column_name = 'hellomoving_response'
  ) THEN
    ALTER TABLE moving_requests ADD COLUMN hellomoving_response text DEFAULT '';
  END IF;
END $$;