#!/usr/bin/env python3
"""
Direct test of Whisper transcription functionality.
This script tests the actual audio-to-text conversion.
"""

import os
import tempfile
import time
from youtube_transcriber import YouTubeTranscriber

def test_whisper_transcription():
    """Test Whisper transcription with a real YouTube video."""
    print("Testing Whisper Transcription")
    print("=" * 50)
    
    # Initialize transcriber with tiny model for faster testing
    print("Initializing YouTubeTranscriber...")
    transcriber = YouTubeTranscriber(model_size="tiny")
    
    # Test with a short YouTube video
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll - short video
    
    print(f"Testing with video: {test_url}")
    
    try:
        # Extract video ID
        video_id = transcriber.extract_video_id(test_url)
        print(f"Video ID: {video_id}")
        
        # Download audio
        print("\n1. Downloading audio...")
        audio_path = transcriber.download_audio(test_url)
        if audio_path and os.path.exists(audio_path):
            print(f"✓ Audio downloaded: {audio_path}")
            print(f"  File size: {os.path.getsize(audio_path)} bytes")
        else:
            print("✗ Audio download failed")
            return False
        
        # Convert to WAV
        print("\n2. Converting audio to WAV...")
        wav_path = transcriber.convert_to_wav(audio_path)
        if wav_path and os.path.exists(wav_path):
            print(f"✓ Audio converted: {wav_path}")
            print(f"  File size: {os.path.getsize(wav_path)} bytes")
        else:
            print("✗ Audio conversion failed")
            return False
        
        # Transcribe with Whisper
        print("\n3. Transcribing with Whisper...")
        start_time = time.time()
        transcription = transcriber.transcribe_audio(wav_path)
        end_time = time.time()
        
        if transcription and 'segments' in transcription:
            print(f"✓ Transcription completed in {end_time - start_time:.2f} seconds")
            print(f"  Number of segments: {len(transcription['segments'])}")
            
            # Show sample transcription
            print("\n4. Sample transcription:")
            for i, segment in enumerate(transcription['segments'][:5]):  # Show first 5 segments
                print(f"  {i+1}. [{segment['start']:.1f}s - {segment['end']:.1f}s] {segment['text']}")
            
            # Format captions
            print("\n5. Formatting captions...")
            captions = transcriber.format_captions(transcription)
            if captions:
                print(f"✓ Captions formatted: {len(captions)} captions")
                print("\n6. Sample formatted captions:")
                for i, caption in enumerate(captions[:3]):  # Show first 3
                    print(f"  {i+1}. {caption['text']} ({caption['startTime']:.1f}s - {caption['endTime']:.1f}s)")
            else:
                print("✗ Caption formatting failed")
                return False
            
            # Cleanup
            print("\n7. Cleaning up temporary files...")
            transcriber.cleanup()
            print("✓ Cleanup completed")
            
            return True
        else:
            print("✗ Transcription failed or returned empty result")
            return False
            
    except Exception as e:
        print(f"✗ Error during transcription: {e}")
        return False

def test_whisper_model_loading():
    """Test if Whisper model loads correctly."""
    print("\nTesting Whisper Model Loading")
    print("=" * 30)
    
    try:
        import whisper
        print("Loading Whisper model (tiny)...")
        model = whisper.load_model("tiny")
        print("✓ Whisper model loaded successfully")
        
        # Test with a simple audio file (if available)
        print("\nTesting model with sample audio...")
        
        # Create a simple test audio file using ffmpeg
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_audio = temp_file.name
        
        # Generate a simple test tone using ffmpeg
        os.system(f'ffmpeg -f lavfi -i "sine=frequency=1000:duration=3" -ar 16000 {temp_audio} -y > /dev/null 2>&1')
        
        if os.path.exists(temp_audio):
            print("Generated test audio file")
            
            # Transcribe the test audio
            result = model.transcribe(temp_audio)
            print(f"✓ Test transcription completed")
            print(f"  Transcribed text: '{result['text'].strip()}'")
            
            # Cleanup
            os.unlink(temp_audio)
            print("✓ Test audio file cleaned up")
            
            return True
        else:
            print("✗ Could not generate test audio file")
            return False
            
    except Exception as e:
        print(f"✗ Error testing Whisper model: {e}")
        return False

def test_audio_processing():
    """Test audio processing pipeline."""
    print("\nTesting Audio Processing Pipeline")
    print("=" * 40)
    
    try:
        from pytube import YouTube
        from pydub import AudioSegment
        
        # Test pytube
        print("1. Testing pytube...")
        yt = YouTube("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        print(f"✓ Video title: {yt.title}")
        
        # Test audio stream
        audio_stream = yt.streams.filter(only_audio=True).first()
        if audio_stream:
            print(f"✓ Audio stream found: {audio_stream}")
        else:
            print("✗ No audio stream found")
            return False
        
        # Test pydub
        print("\n2. Testing pydub...")
        # Create a simple test audio
        test_audio = AudioSegment.silent(duration=1000)  # 1 second of silence
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            test_audio.export(temp_file.name, format="wav")
            temp_path = temp_file.name
        
        if os.path.exists(temp_path):
            print(f"✓ Test audio created: {temp_path}")
            os.unlink(temp_path)
            print("✓ Test audio cleaned up")
            return True
        else:
            print("✗ Could not create test audio")
            return False
            
    except Exception as e:
        print(f"✗ Error testing audio processing: {e}")
        return False

def main():
    """Run all Whisper tests."""
    print("Whisper API Direct Test")
    print("=" * 50)
    
    # Test 1: Model loading
    if not test_whisper_model_loading():
        print("\n❌ Whisper model loading failed")
        return
    
    # Test 2: Audio processing
    if not test_audio_processing():
        print("\n❌ Audio processing failed")
        return
    
    # Test 3: Full transcription
    if not test_whisper_transcription():
        print("\n❌ Full transcription failed")
        return
    
    print("\n" + "=" * 50)
    print("✅ All Whisper tests passed!")
    print("🎉 Whisper API is working correctly and transcribing audio to text!")
    print("\nYour transcription pipeline is ready for production use.")

if __name__ == "__main__":
    main()
