-- Create saved_transcriptions table
CREATE TABLE IF NOT EXISTS saved_transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_title TEXT NOT NULL,
  captions JSONB NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on video_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_transcriptions_video_url ON saved_transcriptions(video_url);

-- Create index on saved_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_transcriptions_saved_at ON saved_transcriptions(saved_at);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can modify this based on your auth requirements)
CREATE POLICY "Allow all operations on saved_transcriptions" ON saved_transcriptions
  FOR ALL USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_transcriptions_updated_at 
  BEFORE UPDATE ON saved_transcriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
