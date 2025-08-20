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

  // Start the Python backend server via the server starter
  private async startBackendServer(): Promise<boolean> {
    if (this.isStartingServer) {
      return false; // Already starting
    }

    this.isStartingServer = true;
    
    try {
      console.log('Starting Python backend server via server starter...');
      
      const response = await fetch(`${this.serverStarterURL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Server starter response:', result);
        
        if (result.success) {
          console.log('Backend server started successfully');
          return true;
        } else {
          console.log('Server starter returned success: false');
          return false;
        }
      } else {
        console.error('Server starter request failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Failed to start server via server starter:', error);
      return false;
    } finally {
      this.isStartingServer = false;
    }
  }

  // Normalize YouTube URL (convert mobile to desktop)
  private normalizeYouTubeUrl(url: string): string {
    // Convert mobile YouTube URL to desktop version
    if (url.includes('m.youtube.com')) {
      const normalizedUrl = url.replace('m.youtube.com', 'www.youtube.com');
      console.log('🔄 Normalized YouTube URL:', url, '→', normalizedUrl);
      return normalizedUrl;
    }
    return url;
  }

  // Start video processing
  async processVideo(youtubeUrl: string, language: string = 'en'): Promise<string> {
    try {
      const normalizedUrl = this.normalizeYouTubeUrl(youtubeUrl);
      console.log(`🚀 Starting video processing for: ${normalizedUrl}`);
      console.log(`🌍 Language: ${language}`);
      
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
}

export default new YouTubeAPI();
