# Python Backend - YouTube Audio Transcription

This Python backend provides YouTube audio downloading and transcription capabilities using pytube and OpenAI Whisper.

## Features

- **YouTube Audio Download**: Download audio from YouTube videos using pytube
- **Audio Transcription**: Transcribe audio using OpenAI Whisper
- **Multiple Languages**: Support for various languages
- **REST API**: Flask-based API for integration with React Native app
- **Background Processing**: Asynchronous video processing with status tracking
- **Caption Formatting**: Format transcriptions into timed caption segments

## Prerequisites

- Python 3.8 or higher
- FFmpeg (required for audio processing)
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

3. **Download Whisper models (first run will download automatically):**
```bash
python -c "import whisper; whisper.load_model('base')"
```

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

### Performance Tips

- Use `tiny` or `base` models for faster processing
- Process videos in background threads
- Clean up temporary files regularly
- Monitor disk space usage

## Development

### Adding New Features

1. **New audio formats:** Extend `convert_to_wav()` method
2. **Additional APIs:** Add new endpoints to `api_server.py`
3. **Custom processing:** Modify `process_video()` method

### Testing

Test individual components:

```bash
# Test audio download
python -c "from youtube_transcriber import YouTubeTranscriber; t = YouTubeTranscriber(); t.download_audio('https://www.youtube.com/watch?v=dQw4w9WgXcQ')"

# Test API server
curl http://localhost:5000/health
```

## License

This project is licensed under the MIT License.
