import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedTranscription {
  id: string;
  video_url: string;
  video_title: string;
  captions: any[];
  language: string;
  saved_at: string;
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
}

export default LocalStorageService;
