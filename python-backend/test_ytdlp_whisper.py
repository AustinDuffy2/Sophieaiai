#!/usr/bin/env python3
"""
Test script using yt-dlp to download YouTube audio and Whisper to transcribe it.
"""

import yt_dlp
import whisper
import tempfile
import os
import json

def download_youtube_audio(url):
    """Download audio from YouTube using yt-dlp."""
    print(f"Downloading audio from: {url}")
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_file.close()
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': temp_file.name.replace('.wav', '.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'quiet': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        # Find the actual output file
        base_name = temp_file.name.replace('.wav', '')
        actual_file = base_name + '.wav'
        
        if os.path.exists(actual_file):
            print(f"✓ Audio downloaded successfully: {actual_file}")
            return actual_file
        else:
            print(f"✗ Audio file not found: {actual_file}")
            return None
            
    except Exception as e:
        print(f"✗ Download failed: {e}")
        return None

def transcribe_audio(audio_file):
    """Transcribe audio using Whisper."""
    print(f"Transcribing audio: {audio_file}")
    
    try:
        # Load Whisper model
        model = whisper.load_model("tiny")
        
        # Transcribe
        result = model.transcribe(audio_file)
        
        print("✓ Transcription completed!")
        print(f"Text: '{result['text']}'")
        print(f"Language: {result.get('language', 'unknown')}")
        
        return result
        
    except Exception as e:
        print(f"✗ Transcription failed: {e}")
        return None

def format_captions(transcription_result):
    """Format transcription result into captions."""
    if not transcription_result or 'segments' not in transcription_result:
        return []
    
    captions = []
    for segment in transcription_result['segments']:
        caption = {
            'text': segment['text'].strip(),
            'startTime': segment['start'],
            'endTime': segment['end']
        }
        captions.append(caption)
    
    return captions

def main():
    """Main test function."""
    print("yt-dlp + Whisper Integration Test")
    print("=" * 50)
    
    # Test URL (first YouTube video - should be reliable)
    test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    
    # Download audio
    audio_file = download_youtube_audio(test_url)
    if not audio_file:
        print("❌ Cannot proceed without audio file")
        return
    
    # Transcribe audio
    transcription = transcribe_audio(audio_file)
    if not transcription:
        print("❌ Cannot proceed without transcription")
        return
    
    # Format captions
    captions = format_captions(transcription)
    
    print(f"\n✓ Generated {len(captions)} captions:")
    for i, caption in enumerate(captions[:5]):  # Show first 5
        print(f"  {i+1}. '{caption['text']}' ({caption['startTime']:.1f}s - {caption['endTime']:.1f}s)")
    
    # Save results
    result = {
        'url': test_url,
        'transcription': transcription['text'],
        'language': transcription.get('language', 'unknown'),
        'captions': captions
    }
    
    with open('test_result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n✓ Results saved to test_result.json")
    
    # Clean up
    try:
        os.unlink(audio_file)
        print(f"✓ Cleaned up: {audio_file}")
    except:
        pass
    
    print("\n" + "=" * 50)
    print("✅ SUCCESS! YouTube audio download and Whisper transcription are working!")
    print("The system can:")
    print("1. Download audio from YouTube videos using yt-dlp")
    print("2. Transcribe audio to text using Whisper")
    print("3. Generate timed captions for your React Native app")

if __name__ == "__main__":
    main()
