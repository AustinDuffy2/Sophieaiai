-- Fix the confidence constraint to allow negative values from Whisper
ALTER TABLE captions DROP CONSTRAINT IF EXISTS check_confidence;

-- Create a new constraint that allows negative values (Whisper can return negative confidence)
ALTER TABLE captions ADD CONSTRAINT check_confidence CHECK (confidence >= -1 AND confidence <= 1);
