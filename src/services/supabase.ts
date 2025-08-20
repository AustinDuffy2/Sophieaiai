import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Caption {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface CaptionTask {
  id: string;
  video_url: string;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  captions?: Caption[];
  error_message?: string;
}

export interface SavedTranscription {
  id: string;
  video_url: string;
  video_title: string;
  captions: Caption[];
  saved_at: string;
  language: string;
}

export class SupabaseService {
  // Check if we already have captions for this video
  static async checkExistingCaptions(videoUrl: string): Promise<string | null> {
    try {
      console.log('🔍 Checking for existing captions:', videoUrl);
      
      // Normalize the URL
      const normalizedUrl = this.normalizeYouTubeUrl(videoUrl);
      
      // Check for completed tasks with this video URL
      const { data, error } = await supabase
        .from('caption_tasks')
        .select('id, status')
        .eq('video_url', normalizedUrl)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error checking existing captions:', error);
        return null;
      }

      if (data && data.length > 0) {
        console.log('✅ Found existing captions for video:', normalizedUrl);
        return data[0].id;
      }

      console.log('❌ No existing captions found for video:', normalizedUrl);
      return null;
    } catch (error) {
      console.error('❌ Failed to check existing captions:', error);
      return null;
    }
  }

  // Normalize YouTube URL to handle different formats
  static normalizeYouTubeUrl(url: string): string {
    // Remove playlist parameters and other extras
    let normalizedUrl = url;
    if (normalizedUrl.includes('&list=')) {
      normalizedUrl = normalizedUrl.split('&list=')[0];
    }
    if (normalizedUrl.includes('&index=')) {
      normalizedUrl = normalizedUrl.split('&index=')[0];
    }
    if (normalizedUrl.includes('&start_radio=')) {
      normalizedUrl = normalizedUrl.split('&start_radio=')[0];
    }
    
    // Convert mobile URLs to desktop
    if (normalizedUrl.includes('m.youtube.com')) {
      normalizedUrl = normalizedUrl.replace('m.youtube.com', 'www.youtube.com');
    }
    
    return normalizedUrl;
  }

  // Send URL to backend for processing
  static async sendUrlForProcessing(videoUrl: string, language: string): Promise<string> {
    try {
      console.log('📤 Sending URL to backend for processing:', videoUrl);
      
      // Normalize the URL before saving
      const normalizedUrl = this.normalizeYouTubeUrl(videoUrl);
      
      // Create a new task record in Supabase
      const { data, error } = await supabase
        .from('caption_tasks')
        .insert([
          {
            video_url: normalizedUrl,
            language: language,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating task:', error);
        throw error;
      }

      console.log('✅ Task created with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Failed to send URL for processing:', error);
      throw error;
    }
  }

  // Poll for task completion
  static async pollTaskCompletion(taskId: string): Promise<CaptionTask> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('caption_tasks')
            .select('*')
            .eq('id', taskId)
            .single();

          if (error) {
            clearInterval(pollInterval);
            reject(error);
            return;
          }

          console.log('📊 Task status:', data.status);

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            resolve(data);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error(data.error_message || 'Processing failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000); // Poll every 2 seconds
    });
  }

  // Get captions for a completed task from the captions table
  static async getCaptions(taskId: string): Promise<Caption[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_captions_for_task', {
          task_uuid: taskId
        });

      if (error) {
        console.error('❌ Error fetching captions:', error);
        throw error;
      }

      // Convert the result to the expected format
      const captions: Caption[] = data.map((row: any) => ({
        id: row.id,
        text: row.text,
        startTime: parseFloat(row.start_time),
        endTime: parseFloat(row.end_time),
        confidence: row.confidence ? parseFloat(row.confidence) : undefined
      }));

      console.log('📝 Fetched captions from database:', captions.length, 'captions');
      return captions;
    } catch (error) {
      console.error('❌ Failed to get captions:', error);
      throw error;
    }
  }

  // Get recent tasks
  static async getRecentTasks(): Promise<CaptionTask[]> {
    try {
      const { data, error } = await supabase
        .from('caption_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error fetching recent tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get recent tasks:', error);
      throw error;
    }
  }

  // Save transcription to saved_transcriptions table
  static async saveTranscription(
    videoUrl: string, 
    videoTitle: string, 
    captions: Caption[], 
    language: string
  ): Promise<string> {
    try {
      console.log('💾 Saving transcription for video:', videoUrl);
      
      const { data, error } = await supabase
        .from('saved_transcriptions')
        .insert([
          {
            video_url: videoUrl,
            video_title: videoTitle,
            captions: captions,
            language: language,
            saved_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error saving transcription:', error);
        throw error;
      }

      console.log('✅ Transcription saved with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Failed to save transcription:', error);
      throw error;
    }
  }

  // Get all saved transcriptions
  static async getSavedTranscriptions(): Promise<SavedTranscription[]> {
    try {
      const { data, error } = await supabase
        .from('saved_transcriptions')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching saved transcriptions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get saved transcriptions:', error);
      throw error;
    }
  }

  // Delete saved transcription
  static async deleteSavedTranscription(transcriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('saved_transcriptions')
        .delete()
        .eq('id', transcriptionId);

      if (error) {
        console.error('❌ Error deleting transcription:', error);
        throw error;
      }

      console.log('✅ Transcription deleted:', transcriptionId);
    } catch (error) {
      console.error('❌ Failed to delete transcription:', error);
      throw error;
    }
  }

  // Check if transcription is already saved
  static async isTranscriptionSaved(videoUrl: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('saved_transcriptions')
        .select('id')
        .eq('video_url', videoUrl)
        .limit(1);

      if (error) {
        console.error('❌ Error checking if transcription is saved:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('❌ Failed to check if transcription is saved:', error);
      return false;
    }
  }
}
