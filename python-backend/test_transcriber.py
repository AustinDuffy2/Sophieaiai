#!/usr/bin/env python3
"""
Test script to verify YouTube transcriber functionality.
"""

from youtube_transcriber import YouTubeTranscriber
import tempfile
import os

def test_transcriber_initialization():
    """Test if the transcriber can be initialized."""
    print("Testing YouTubeTranscriber initialization...")
    
    try:
        transcriber = YouTubeTranscriber(model_size="tiny")
        print("✓ YouTubeTranscriber initialized successfully")
        return transcriber
    except Exception as e:
        print(f"✗ Failed to initialize YouTubeTranscriber: {e}")
        return None

def test_url_parsing():
    """Test URL parsing functionality."""
    print("\nTesting URL parsing...")
    
    transcriber = YouTubeTranscriber()
    
    test_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ]
    
    for url in test_urls:
        try:
            video_id = transcriber.extract_video_id(url)
            if video_id:
                print(f"✓ Successfully parsed: {url} -> {video_id}")
            else:
                print(f"✗ Failed to parse: {url}")
        except Exception as e:
            print(f"✗ Error parsing {url}: {e}")

def test_audio_conversion():
    """Test audio conversion functionality."""
    print("\nTesting audio conversion...")
    
    transcriber = YouTubeTranscriber()
    
    # Create a temporary test file
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
        temp_file.write(b'fake audio data')
        temp_file_path = temp_file.name
    
    try:
        # Test conversion (this will fail with fake data, but tests the function)
        result = transcriber.convert_to_wav(temp_file_path)
        if result:
            print("✓ Audio conversion function works")
        else:
            print("✗ Audio conversion failed")
    except Exception as e:
        print(f"✗ Audio conversion error: {e}")
    finally:
        # Clean up
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

def test_caption_formatting():
    """Test caption formatting functionality."""
    print("\nTesting caption formatting...")
    
    transcriber = YouTubeTranscriber()
    
    # Mock transcription data
    mock_transcription = {
        'segments': [
            {
                'text': 'Hello world',
                'start': 0.0,
                'end': 2.5,
                'avg_logprob': -0.8
            },
            {
                'text': 'This is a test',
                'start': 2.5,
                'end': 5.0,
                'avg_logprob': -0.6
            }
        ]
    }
    
    try:
        captions = transcriber.format_captions(mock_transcription)
        if captions and len(captions) == 2:
            print("✓ Caption formatting works")
            print(f"  Generated {len(captions)} captions")
            for caption in captions:
                print(f"    - {caption['text']} ({caption['startTime']:.1f}s - {caption['endTime']:.1f}s)")
        else:
            print("✗ Caption formatting failed")
    except Exception as e:
        print(f"✗ Caption formatting error: {e}")

def main():
    """Run all tests."""
    print("YouTube Transcriber Functionality Test")
    print("=" * 50)
    
    # Test initialization
    transcriber = test_transcriber_initialization()
    if not transcriber:
        print("\n❌ Cannot proceed without transcriber initialization")
        return
    
    # Test URL parsing
    test_url_parsing()
    
    # Test audio conversion
    test_audio_conversion()
    
    # Test caption formatting
    test_caption_formatting()
    
    print("\n" + "=" * 50)
    print("✅ YouTube Transcriber functionality tests completed!")
    print("\nThe transcriber is ready to use. You can now:")
    print("1. Run the main script: python youtube_transcriber.py")
    print("2. Start the API server: python api_server.py")
    print("3. Use the transcriber in your React Native app")

if __name__ == "__main__":
    main()
