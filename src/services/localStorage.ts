import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedTranscription {
  id: string;
  video_url: string;
  video_title: string;
  captions: any[];
  language: string;
  saved_at: string;
}

export interface QueuedVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  addedAt: string;
  videoId?: string;
  channelTitle?: string;
  viewCount?: string;
  publishedAt?: string;
}

class LocalStorageService {
  private static STORAGE_KEY = 'saved_transcriptions';

  static async saveTranscription(
    videoUrl: string,
    videoTitle: string,
    captions: any[],
    language: string = 'en'
  ): Promise<void> {
    try {
      const existingTranscriptions = await this.getSavedTranscriptions();
      
      const newTranscription: SavedTranscription = {
        id: Date.now().toString(),
        video_url: videoUrl,
        video_title: videoTitle,
        captions: captions,
        language: language,
        saved_at: new Date().toISOString(),
      };

      // Check if transcription already exists for this video
      const existingIndex = existingTranscriptions.findIndex(
        t => t.video_url === videoUrl
      );

      if (existingIndex >= 0) {
        // Update existing transcription
        existingTranscriptions[existingIndex] = newTranscription;
      } else {
        // Add new transcription
        existingTranscriptions.push(newTranscription);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(existingTranscriptions)
      );

      console.log('✅ Transcription saved locally:', newTranscription.id);
    } catch (error) {
      console.error('❌ Error saving transcription locally:', error);
      throw error;
    }
  }

  static async getSavedTranscriptions(): Promise<SavedTranscription[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error getting saved transcriptions:', error);
      return [];
    }
  }

  static async deleteSavedTranscription(id: string): Promise<void> {
    try {
      const existingTranscriptions = await this.getSavedTranscriptions();
      const filteredTranscriptions = existingTranscriptions.filter(
        t => t.id !== id
      );
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(filteredTranscriptions)
      );

      console.log('✅ Transcription deleted locally:', id);
    } catch (error) {
      console.error('❌ Error deleting transcription:', error);
      throw error;
    }
  }

  static async isTranscriptionSaved(videoUrl: string): Promise<boolean> {
    try {
      const existingTranscriptions = await this.getSavedTranscriptions();
      return existingTranscriptions.some(t => t.video_url === videoUrl);
    } catch (error) {
      console.error('❌ Error checking if transcription is saved:', error);
      return false;
    }
  }

  // Queue Management Methods
  static async addToQueue(video: Omit<QueuedVideo, 'id' | 'addedAt'>): Promise<void> {
    try {
      const existingQueue = await this.getQueuedVideos();
      
      const newQueuedVideo: QueuedVideo = {
        id: Date.now().toString(),
        ...video,
        addedAt: new Date().toISOString(),
      };

      // Check if video already exists in queue
      const existingIndex = existingQueue.findIndex(v => v.url === video.url);
      if (existingIndex >= 0) {
        console.log('⚠️ Video already in queue');
        return;
      }

      existingQueue.push(newQueuedVideo);
      await AsyncStorage.setItem('queued_videos', JSON.stringify(existingQueue));
      console.log('✅ Video added to queue:', newQueuedVideo.title);
    } catch (error) {
      console.error('❌ Error adding video to queue:', error);
      throw error;
    }
  }

  static async getQueuedVideos(): Promise<QueuedVideo[]> {
    try {
      const data = await AsyncStorage.getItem('queued_videos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error getting queued videos:', error);
      return [];
    }
  }

  static async removeQueuedVideo(videoId: string): Promise<void> {
    try {
      const existingQueue = await this.getQueuedVideos();
      const filteredQueue = existingQueue.filter(v => v.id !== videoId);
      await AsyncStorage.setItem('queued_videos', JSON.stringify(filteredQueue));
      console.log('✅ Video removed from queue:', videoId);
    } catch (error) {
      console.error('❌ Error removing video from queue:', error);
      throw error;
    }
  }

  static async clearQueuedVideos(): Promise<void> {
    try {
      await AsyncStorage.removeItem('queued_videos');
      console.log('✅ Queue cleared');
    } catch (error) {
      console.error('❌ Error clearing queue:', error);
      throw error;
    }
  }

  static async clearAllTranscriptions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ All transcriptions cleared');
    } catch (error) {
      console.error('❌ Error clearing transcriptions:', error);
      throw error;
    }
  }

  static async isVideoQueued(videoUrl: string): Promise<boolean> {
    try {
      const existingQueue = await this.getQueuedVideos();
      return existingQueue.some(v => v.url === videoUrl);
    } catch (error) {
      console.error('❌ Error checking if video is queued:', error);
      return false;
    }
  }
}

export default LocalStorageService;
