-- Create a dedicated captions table for better data structure
CREATE TABLE IF NOT EXISTS captions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES caption_tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    start_time DECIMAL(10,3) NOT NULL,
    end_time DECIMAL(10,3) NOT NULL,
    confidence DECIMAL(5,4),
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for better performance
    CONSTRAINT fk_captions_task FOREIGN KEY (task_id) REFERENCES caption_tasks(id),
    CONSTRAINT check_time_order CHECK (start_time <= end_time),
    CONSTRAINT check_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_captions_task_id ON captions(task_id);
CREATE INDEX IF NOT EXISTS idx_captions_start_time ON captions(start_time);
CREATE INDEX IF NOT EXISTS idx_captions_sequence ON captions(task_id, sequence_order);

-- Enable Row Level Security
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Allow all operations for service role" ON captions
    FOR ALL USING (true);

-- Create a function to get captions for a task with proper ordering
CREATE OR REPLACE FUNCTION get_captions_for_task(task_uuid UUID)
RETURNS TABLE (
    id UUID,
    text TEXT,
    start_time DECIMAL(10,3),
    end_time DECIMAL(10,3),
    confidence DECIMAL(5,4),
    sequence_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.text,
        c.start_time,
        c.end_time,
        c.confidence,
        c.sequence_order
    FROM captions c
    WHERE c.task_id = task_uuid
    ORDER BY c.sequence_order ASC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert multiple captions for a task
CREATE OR REPLACE FUNCTION insert_captions_for_task(
    task_uuid UUID,
    captions_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
    caption_record JSONB;
    sequence_counter INTEGER := 0;
    inserted_count INTEGER := 0;
BEGIN
    -- Delete existing captions for this task
    DELETE FROM captions WHERE task_id = task_uuid;
    
    -- Insert new captions
    FOR caption_record IN SELECT * FROM jsonb_array_elements(captions_data)
    LOOP
        INSERT INTO captions (
            task_id,
            text,
            start_time,
            end_time,
            confidence,
            sequence_order
        ) VALUES (
            task_uuid,
            caption_record->>'text',
            (caption_record->>'startTime')::DECIMAL(10,3),
            (caption_record->>'endTime')::DECIMAL(10,3),
            COALESCE((caption_record->>'confidence')::DECIMAL(5,4), 0.0),
            sequence_counter
        );
        
        sequence_counter := sequence_counter + 1;
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;
