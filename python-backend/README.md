# Python Backend - YouTube Audio Transcription

This Python backend provides YouTube audio downloading and transcription capabilities using yt-dlp and OpenAI Whisper with **fast API integration** for significantly improved performance.

## Features

- **YouTube Audio Download**: Download audio from YouTube videos using yt-dlp
- **Fast Audio Transcription**: Transcribe audio using OpenAI's Whisper API for 10x faster processing
- **Local Fallback**: Automatic fallback to local Whisper model if API is unavailable
- **Multiple Languages**: Support for various languages
- **REST API**: Flask-based API for integration with React Native app
- **Background Processing**: Asynchronous video processing with status tracking
- **Caption Formatting**: Format transcriptions into timed caption segments

## Prerequisites

- Python 3.8 or higher
- FFmpeg (required for audio processing)
- OpenAI API key (for fast processing - optional but recommended)
- Sufficient disk space for audio files and models

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Installation

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp env.template .env
# Edit .env and add your OpenAI API key for fast processing
```

4. **Download Whisper models (first run will download automatically):**
```bash
python -c "import whisper; whisper.load_model('base')"
```

## Fast API Integration

This backend now supports **OpenAI's Whisper API** for significantly faster transcription processing:

### Performance Comparison
- **Local Whisper Model**: 2-10 minutes for a 10-minute video
- **OpenAI Whisper API**: 30-60 seconds for a 10-minute video (10x faster!)

### Setup
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```
3. The system will automatically use the fast API when available

### Fallback Behavior
- If OpenAI API key is not configured, it falls back to local Whisper model
- If API call fails, it automatically retries with local model
- No functionality is lost - just slower processing

## Usage

### 1. Direct Script Usage

Run the transcription script directly:

```bash
python youtube_transcriber.py
```

Edit the `main()` function in `youtube_transcriber.py` to change the YouTube URL.

### 2. API Server

Start the Flask API server:

```bash
python api_server.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Process Video
```
POST /process
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en"
}
```
Starts video processing and returns a task ID.

### Check Status
```
GET /status/{task_id}
```
Returns processing status and results.

### Get Captions
```
GET /captions/{task_id}
```
Returns captions for completed tasks.

### Cleanup
```
POST /cleanup
```
Removes old completed tasks.

## Example API Usage

### 1. Start Processing
```bash
curl -X POST http://localhost:5000/process \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "language": "en"
  }'
```

Response:
```json
{
  "task_id": "task_1703123456789",
  "status": "queued",
  "message": "Video processing started"
}
```

### 2. Check Status
```bash
curl http://localhost:5000/status/task_1703123456789
```

Response:
```json
{
  "task_id": "task_1703123456789",
  "status": "completed",
  "result": {
    "video_id": "dQw4w9WgXcQ",
    "title": "Video Title",
    "duration": 180,
    "language": "en",
    "captions": [
      {
        "id": 1,
        "text": "Hello world",
        "startTime": 0.0,
        "endTime": 2.5,
        "confidence": -0.8
      }
    ],
    "processed_at": "2023-12-21T10:30:45.123456"
  }
}
```

## Integration with React Native

The API is designed to work with the React Native app. Update the React Native app to call these endpoints:

1. **Start processing** when user selects language
2. **Poll status** to show progress
3. **Display captions** when processing completes

## Configuration

### Whisper Model Sizes

- `tiny`: Fastest, least accurate
- `base`: Good balance (default)
- `small`: Better accuracy
- `medium`: High accuracy
- `large`: Best accuracy, slowest

Change in `YouTubeTranscriber(model_size="base")`

### Supported Languages

Whisper supports many languages. Common codes:
- `en`: English
- `es`: Spanish
- `fr`: French
- `de`: German
- `it`: Italian
- `pt`: Portuguese
- `ru`: Russian
- `ja`: Japanese
- `ko`: Korean
- `zh`: Chinese

## File Structure

```
python-backend/
├── requirements.txt          # Python dependencies
├── youtube_transcriber.py    # Main transcription script
├── api_server.py            # Flask API server
└── README.md                # This file
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found:**
   - Install FFmpeg and ensure it's in PATH
   - Restart terminal after installation

2. **Whisper model download fails:**
   - Check internet connection
   - Try downloading manually: `python -c "import whisper; whisper.load_model('base')"`

3. **pytube errors:**
   - YouTube may have changed their API
   - Update pytube: `pip install --upgrade pytube`

4. **Memory issues:**
   - Use smaller Whisper model (tiny/base)
   - Process shorter videos
   - Increase system memory

5. **Fast API issues:**
   - Check OpenAI API key is set correctly in `.env`
   - Verify internet connection for API calls
   - Check OpenAI API usage limits and billing
   - System will automatically fall back to local model

### Performance Tips

- **For fastest processing:** Use OpenAI Whisper API (requires API key)
- **For offline processing:** Use `tiny` or `base` local models
- Process videos in background threads
- Clean up temporary files regularly
- Monitor disk space usage

## Development

### Adding New Features

1. **New audio formats:** Extend `convert_to_wav()` method
2. **Additional APIs:** Add new endpoints to `api_server.py`
3. **Custom processing:** Modify `process_video()` method

### Testing

#### Basic Installation Test
Test individual components:

```bash
# Test audio download
python -c "from youtube_transcriber import YouTubeTranscriber; t = YouTubeTranscriber(); t.download_audio('https://www.youtube.com/watch?v=dQw4w9WgXcQ')"

# Test API server
curl http://localhost:5000/health

# Run comprehensive installation test
python test_installation.py
```

#### Fast API Integration Test
Test the fast API integration:

```bash
python test_fast_api.py
```

This will verify:
- OpenAI API key configuration
- Fast API transcription capability
- Local fallback functionality
- API server integration

## License

This project is licensed under the MIT License.
