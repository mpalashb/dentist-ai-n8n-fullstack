-- Create a table for voice records
CREATE TABLE IF NOT EXISTS public.voice_records (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  transcript TEXT,
  language TEXT,
  tags TEXT[], -- array of tags
  is_public BOOLEAN DEFAULT FALSE,
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS voice_records_profile_id_idx ON public.voice_records(profile_id);
CREATE INDEX IF NOT EXISTS voice_records_created_at_idx ON public.voice_records(created_at);
CREATE INDEX IF NOT EXISTS voice_records_is_public_idx ON public.voice_records(is_public);
CREATE INDEX IF NOT EXISTS voice_records_processing_status_idx ON public.voice_records(processing_status);

-- Set up Row Level Security (RLS)
ALTER TABLE public.voice_records ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own voice records
CREATE POLICY "Users can view own voice records" ON public.voice_records
  FOR SELECT USING (auth.uid() = profile_id);

-- Create a policy to allow users to insert their own voice records
CREATE POLICY "Users can insert own voice records" ON public.voice_records
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Create a policy to allow users to update their own voice records
CREATE POLICY "Users can update own voice records" ON public.voice_records
  FOR UPDATE USING (auth.uid() = profile_id);

-- Create a policy to allow users to delete their own voice records
CREATE POLICY "Users can delete own voice records" ON public.voice_records
  FOR DELETE USING (auth.uid() = profile_id);

-- Create a policy to allow anyone to view public voice records
CREATE POLICY "Anyone can view public voice records" ON public.voice_records
  FOR SELECT USING (is_public = TRUE);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_voice_record_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to execute the function when a voice record is updated
CREATE TRIGGER on_voice_record_updated
  BEFORE UPDATE ON public.voice_records
  FOR EACH ROW EXECUTE PROCEDURE public.handle_voice_record_update();