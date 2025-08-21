import axios from 'axios';

const API_BASE_URL = 'http://10.0.0.177:5001'; // Your local IP address
const SERVER_STARTER_URL = 'http://10.0.0.177:3001'; // Server starter URL

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
}

export interface Caption {
  text: string;
  startTime: number;
  endTime: number;
}

export interface CaptionResult {
  task_id: string;
  captions: Caption[];
}

class YouTubeAPI {
  private baseURL: string;
  private serverStarterURL: string;
  private isStartingServer: boolean = false;

  constructor(baseURL: string = API_BASE_URL, serverStarterURL: string = SERVER_STARTER_URL) {
    this.baseURL = baseURL;
    this.serverStarterURL = serverStarterURL;
  }

  // Start the Python backend server
  private async startBackendServer(): Promise<boolean> {
    if (this.isStartingServer) {
      return false; // Already starting
    }

    this.isStartingServer = true;
    
    try {
      console.log('🚀 Starting Python backend server...');
      
      // Try to start the backend using the server-starter script
      const response = await fetch('http://10.0.0.177:3001/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Server starter response:', result);
        
        if (result.success) {
          console.log('✅ Backend server started successfully via server starter');
          return true;
        } else {
          console.log('❌ Server starter returned success: false');
          return false;
        }
      } else {
        console.log('⚠️ Server starter not available, trying alternative method...');
        // If server starter is not available, we'll just return false
        // and let the user know they need to start the backend manually
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to start server via server starter:', error);
      console.log('💡 Please start the backend manually using: npm run backend');
      return false;
    } finally {
      this.isStartingServer = false;
    }
  }

  // Normalize YouTube URL (convert mobile to desktop)
  private normalizeYouTubeUrl(url: string): string {
    console.log('🔍 Normalizing URL:', url);
    
    let normalizedUrl = url;
    
    // Convert mobile YouTube URL to desktop version
    if (url.includes('m.youtube.com')) {
      normalizedUrl = url.replace('m.youtube.com', 'www.youtube.com');
      console.log('🔄 Converted mobile to desktop:', url, '→', normalizedUrl);
    }
    
    // Remove any extra parameters that might cause issues
    if (normalizedUrl.includes('&pp=')) {
      normalizedUrl = normalizedUrl.split('&pp=')[0];
      console.log('🔄 Removed pp parameter:', normalizedUrl);
    }
    
    // Ensure we have a clean YouTube URL
    if (!normalizedUrl.includes('youtube.com/watch?v=') && !normalizedUrl.includes('youtu.be/')) {
      console.log('⚠️ URL might not be a valid YouTube URL:', normalizedUrl);
    }
    
    console.log('✅ Final normalized URL:', normalizedUrl);
    return normalizedUrl;
  }

  // Start video processing
  async processVideo(youtubeUrl: string, language: string = 'en'): Promise<string> {
    try {
      // First check if backend is running
      console.log('🔍 Checking if backend is running...');
      const isHealthy = await this.healthCheck();
      
      if (!isHealthy) {
        console.log('⚠️ Backend not running, attempting to start...');
        const started = await this.startBackendServer();
        
        if (!started) {
          throw new Error('Failed to start backend server. Please start it manually.');
        }
        
        // Wait a bit for the server to fully start
        console.log('⏳ Waiting for backend to fully start...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check again
        const isHealthyAfterStart = await this.healthCheck();
        if (!isHealthyAfterStart) {
          throw new Error('Backend server started but is not responding. Please check the server.');
        }
      }
      
      const normalizedUrl = this.normalizeYouTubeUrl(youtubeUrl);
      console.log(`🚀 Starting video processing for: ${normalizedUrl}`);
      console.log(`🌍 Language: ${language}`);
      console.log(`📤 Sending to backend:`, {
        url: normalizedUrl,
        language: language
      });
      
      const response = await axios.post(`${this.baseURL}/process`, {
        url: normalizedUrl,
        language: language
      });
      
      const taskId = response.data.task_id;
      console.log(`✅ Processing started with task ID: ${taskId}`);
      return taskId;
    } catch (error) {
      console.error('❌ Error starting video processing:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  // Check processing status
  async getStatus(taskId: string): Promise<ProcessingStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }

  // Get completed captions
  async getCaptions(taskId: string): Promise<Caption[]> {
    try {
      const response = await axios.get(`${this.baseURL}/captions/${taskId}`);
      return response.data.captions;
    } catch (error) {
      console.error('Error getting captions:', error);
      throw error;
    }
  }

  // Health check (backend is always running)
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  // Poll status until completion
  async pollUntilComplete(taskId: string, onProgress?: (status: ProcessingStatus) => void): Promise<ProcessingStatus> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await this.getStatus(taskId);
          
          if (onProgress) {
            onProgress(status);
          }
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            resolve(status);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error(status.error || 'Processing failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000); // Poll every 2 seconds
    });
  }

  // Transcribe video (complete process)
  async transcribeVideo(youtubeUrl: string, language: string = 'en'): Promise<{ success: boolean; captions?: Caption[]; language?: string; error?: string }> {
    try {
      console.log('🎤 Starting transcription for:', youtubeUrl);
      
      // Start the processing
      const taskId = await this.processVideo(youtubeUrl, language);
      
      // Poll until completion
      const finalStatus = await this.pollUntilComplete(taskId, (status) => {
        console.log('📊 Processing status:', status.status, status.progress ? `${status.progress}%` : '');
      });
      
      if (finalStatus.status === 'completed') {
        // Get the captions
        const captions = await this.getCaptions(taskId);
        console.log('✅ Transcription completed successfully');
        
        return {
          success: true,
          captions: captions,
          language: language
        };
      } else {
        throw new Error(finalStatus.error || 'Processing failed');
      }
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

const api = new YouTubeAPI();
export { api };
