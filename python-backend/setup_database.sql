-- Create the caption_tasks table
CREATE TABLE IF NOT EXISTS caption_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    captions JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_caption_tasks_status ON caption_tasks(status);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_caption_tasks_created_at ON caption_tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE caption_tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now, since we're using service role)
CREATE POLICY "Allow all operations for service role" ON caption_tasks
    FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_caption_tasks_updated_at 
    BEFORE UPDATE ON caption_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
