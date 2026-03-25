/*
  # Add subid column to moving_requests

  1. Modified Tables
    - `moving_requests`
      - Added `subid` (text, nullable) - stores the lead provider's unique click ID
        from the URL query parameter when traffic comes from a lead provider

  2. Notes
    - Column is nullable because direct traffic will not have a subid
    - No default value needed since null is appropriate for organic/direct leads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'moving_requests' AND column_name = 'subid'
  ) THEN
    ALTER TABLE moving_requests ADD COLUMN subid text;
  END IF;
END $$;
