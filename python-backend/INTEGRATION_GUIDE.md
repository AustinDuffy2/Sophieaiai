# React Native Integration Guide

This guide shows how to integrate your React Native app with the Python YouTube transcription backend.

## 🚀 Quick Start

1. **Start the Python API Server:**
   ```bash
   cd python-backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python api_server.py
   ```

2. **The server will be available at:**
   - Local: `http://localhost:5000`
   - Network: `http://10.0.0.177:5000` (your local IP)

## 📱 React Native Integration

### 1. Install Required Packages

```bash
cd /path/to/your/react-native/app
npm install axios
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://10.0.0.177:5000'; // Use your local IP

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export interface Caption {
  text: string;
  startTime: number;
  endTime: number;
}

class YouTubeAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Start video processing
  async processVideo(youtubeUrl: string, language: string = 'en'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/process`, {
        url: youtubeUrl,
        language: language
      });
      return response.data.task_id;
    } catch (error) {
      console.error('Error starting video processing:', error);
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

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default new YouTubeAPI();
```

### 3. Update ExploreScreen.tsx

Replace the mock processing with real API calls:

```typescript
// In src/screens/ExploreScreen.tsx

import YouTubeAPI, { Caption } from '../services/api';

// Add state for API integration
const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
const [realCaptions, setRealCaptions] = useState<Caption[]>([]);

// Update handleLanguageSelect
const handleLanguageSelect = async (language: Language) => {
  setSelectedLanguage(language);
  setShowLanguageSelector(false);
  setShowProcessingModal(true);
  
  try {
    // Start real video processing
    const taskId = await YouTubeAPI.processVideo(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video URL
      language.code
    );
    setCurrentTaskId(taskId);
    
    // Poll for status updates
    pollProcessingStatus(taskId);
  } catch (error) {
    console.error('Failed to start processing:', error);
    // Fall back to mock processing
    handleProcessingComplete();
  }
};

// Add polling function
const pollProcessingStatus = async (taskId: string) => {
  const pollInterval = setInterval(async () => {
    try {
      const status = await YouTubeAPI.getStatus(taskId);
      
      if (status.status === 'completed') {
        clearInterval(pollInterval);
        const captions = await YouTubeAPI.getCaptions(taskId);
        setRealCaptions(captions);
        handleProcessingComplete();
      } else if (status.status === 'failed') {
        clearInterval(pollInterval);
        console.error('Processing failed:', status.message);
        // Fall back to mock processing
        handleProcessingComplete();
      }
    } catch (error) {
      console.error('Error polling status:', error);
      clearInterval(pollInterval);
      // Fall back to mock processing
      handleProcessingComplete();
    }
  }, 2000); // Poll every 2 seconds
};

// Update handleProcessingComplete
const handleProcessingComplete = () => {
  setShowProcessingModal(false);
  setShowCaptions(true);
};
```

### 4. Update CaptionOverlay.tsx

Use real captions instead of mock data:

```typescript
// In src/components/CaptionOverlay.tsx

interface CaptionOverlayProps {
  visible: boolean;
  onClose: () => void;
  captions: Caption[]; // Pass real captions from parent
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  visible,
  onClose,
  captions
}) => {
  // Use real captions instead of mock data
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  
  useEffect(() => {
    if (!visible || captions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCaptionIndex(prev => {
        const next = prev + 1;
        return next >= captions.length ? 0 : next;
      });
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(interval);
  }, [visible, captions]);
  
  const currentCaption = captions[currentCaptionIndex] || { text: '', startTime: 0, endTime: 0 };
  
  // Rest of the component remains the same...
};
```

## 🔧 Configuration

### Network Configuration

1. **Find your local IP address:**
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig | findstr "IPv4"
   ```

2. **Update the API_BASE_URL in your React Native app:**
   ```typescript
   const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000';
   ```

### iOS Configuration

Add to `ios/YourApp/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## 🧪 Testing

### Test API Endpoints

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Start Processing:**
   ```bash
   curl -X POST http://localhost:5000/process \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "language": "en"}'
   ```

3. **Check Status:**
   ```bash
   curl http://localhost:5000/status/TASK_ID_HERE
   ```

4. **Get Captions:**
   ```bash
   curl http://localhost:5000/captions/TASK_ID_HERE
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Make sure the Python server is running
   - Check if the port 5000 is available
   - Verify the IP address is correct

2. **CORS Errors:**
   - The Flask server includes CORS headers
   - If issues persist, check network configuration

3. **Processing Timeouts:**
   - Video processing can take 1-5 minutes depending on length
   - Check server logs for errors

4. **Memory Issues:**
   - Large videos may require more memory
   - Consider using smaller Whisper models

### Debug Mode

Enable debug logging in the Python server:
```python
# In api_server.py
app.run(debug=True, host='0.0.0.0', port=5000)
```

## 📊 Performance Tips

1. **Use smaller Whisper models for faster processing:**
   - `tiny` (39MB) - Fastest, lower accuracy
   - `base` (74MB) - Good balance
   - `small` (244MB) - Better accuracy
   - `medium` (769MB) - Best accuracy

2. **Implement caching:**
   - Store processed captions to avoid re-processing
   - Use video ID as cache key

3. **Background processing:**
   - The API already supports background processing
   - Implement proper status polling in your app

## 🔄 Next Steps

1. **Replace mock data** in your React Native app with real API calls
2. **Add error handling** for network failures
3. **Implement caching** for processed videos
4. **Add progress indicators** during processing
5. **Test with real YouTube URLs** from your app

Your Python backend is ready to provide real YouTube video transcription to your React Native app! 🎉
