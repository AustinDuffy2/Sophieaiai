# Fast API Integration Guide

## Overview

The YouTube transcription system now supports **OpenAI's Whisper API** for significantly faster processing. This integration provides a 10x speed improvement while maintaining full backward compatibility.

## Performance Comparison

| Method | Processing Time (10-min video) | Setup Required | Cost |
|--------|-------------------------------|----------------|------|
| **Local Whisper Model** | 2-10 minutes | None | Free |
| **OpenAI Whisper API** | 30-60 seconds | API Key | ~$0.006/minute |

## How It Works

### Current Process (Before)
1. Download YouTube audio → 30-60 seconds
2. Convert to WAV format → 10-30 seconds  
3. **Local Whisper transcription → 2-10 minutes** ⚠️ **Bottleneck**
4. Format captions → 1-5 seconds

### New Process (With Fast API)
1. Download YouTube audio → 30-60 seconds
2. Convert to WAV format → 10-30 seconds
3. **OpenAI Whisper API transcription → 30-60 seconds** 🚀 **10x Faster**
4. Format captions → 1-5 seconds

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Configure Environment
```bash
# Copy environment template
cp env.template .env

# Edit .env file and add your API key
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Install Dependencies
```bash
# Run the setup script
./setup_fast_api.sh

# Or manually
pip install openai==1.3.0
```

### 4. Test Installation
```bash
python test_fast_api.py
```

## Automatic Fallback

The system includes intelligent fallback behavior:

1. **If API key is missing**: Uses local Whisper model
2. **If API call fails**: Automatically retries with local model
3. **If network is down**: Falls back to local processing
4. **If API quota exceeded**: Uses local model

**No functionality is lost** - just slower processing when API is unavailable.

## Usage

### For Users
- **No changes needed** - the app automatically uses fast API when available
- **Same interface** - captions icon works exactly the same
- **Faster results** - processing completes in seconds instead of minutes

### For Developers
The system automatically detects and uses the best available method:

```python
# Fast API (if configured)
transcriber = YouTubeTranscriber(use_fast_api=True)

# Local model only (for offline use)
transcriber = YouTubeTranscriber(use_fast_api=False)
```

## Cost Analysis

### OpenAI Whisper API Pricing
- **$0.006 per minute** of audio processed
- **10-minute video** = ~$0.06
- **1-hour video** = ~$0.36

### Cost Comparison
| Video Length | Local Processing | OpenAI API | Savings |
|--------------|------------------|------------|---------|
| 5 minutes | 1-5 minutes | $0.03 | Time |
| 10 minutes | 2-10 minutes | $0.06 | Time |
| 30 minutes | 6-30 minutes | $0.18 | Time |
| 1 hour | 12-60 minutes | $0.36 | Time |

**Note**: You're paying for speed, not functionality. Local processing remains free.

## Troubleshooting

### Common Issues

#### "OpenAI API key not found"
- Check `.env` file exists and contains `OPENAI_API_KEY=sk-...`
- Restart the API server after adding the key
- Verify the key is valid at https://platform.openai.com/api-keys

#### "API call failed"
- Check internet connection
- Verify API key has sufficient credits
- Check OpenAI service status
- System will automatically fall back to local processing

#### "Still slow processing"
- Verify fast API is being used (check logs for "🚀 Using OpenAI Whisper API")
- Check if fallback to local model occurred
- Ensure API key is correctly configured

### Debug Mode
Enable detailed logging to see which method is being used:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Migration Guide

### From Local-Only Setup
1. Get OpenAI API key
2. Add to `.env` file
3. Restart API server
4. No code changes needed

### From Previous Version
1. Update dependencies: `pip install -r requirements.txt`
2. Add OpenAI API key to `.env`
3. Restart API server
4. Enjoy faster processing!

## Best Practices

### For Production
- **Always have API key configured** for best user experience
- **Monitor API usage** to avoid unexpected costs
- **Keep local models** as backup for reliability
- **Test fallback behavior** regularly

### For Development
- **Use local models** during development to avoid API costs
- **Test both paths** to ensure fallback works
- **Monitor processing times** to verify improvements

## Security Notes

- **API keys are sensitive** - never commit them to version control
- **Use environment variables** - the `.env` file is already in `.gitignore`
- **Rotate keys regularly** - follow OpenAI's security best practices
- **Monitor usage** - set up alerts for unusual API usage

## Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Run test script** to verify setup: `python test_fast_api.py`
3. **Verify API key** at https://platform.openai.com/api-keys
4. **Test fallback** by temporarily removing API key

The system is designed to be robust and will always provide transcription functionality, even if the fast API is unavailable.
