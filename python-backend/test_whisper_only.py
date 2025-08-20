#!/usr/bin/env python3
"""
Test script to verify Whisper is working correctly.
"""

import whisper
import tempfile
import os
import requests

def test_whisper_model_loading():
    """Test if Whisper model can be loaded."""
    print("Testing Whisper model loading...")
    try:
        model = whisper.load_model("tiny")
        print("✓ Whisper model loaded successfully")
        return model
    except Exception as e:
        print(f"✗ Failed to load Whisper model: {e}")
        return None

def download_sample_audio():
    """Download a sample audio file for testing."""
    print("\nDownloading sample audio file...")
    
    # URL to a short audio file (public domain)
    audio_url = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    
    try:
        response = requests.get(audio_url, timeout=30)
        if response.status_code == 200:
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file.write(response.content)
            temp_file.close()
            print(f"✓ Sample audio downloaded: {temp_file.name}")
            return temp_file.name
        else:
            print(f"✗ Failed to download audio: {response.status_code}")
            return None
    except Exception as e:
        print(f"✗ Error downloading audio: {e}")
        return None

def test_whisper_transcription(model, audio_file):
    """Test Whisper transcription."""
    print(f"\nTesting Whisper transcription on: {audio_file}")
    
    try:
        # Transcribe the audio
        result = model.transcribe(audio_file)
        
        print("✓ Transcription completed successfully!")
        print(f"Transcribed text: '{result['text']}'")
        print(f"Language detected: {result.get('language', 'unknown')}")
        
        if 'segments' in result:
            print(f"Number of segments: {len(result['segments'])}")
            for i, segment in enumerate(result['segments'][:3]):  # Show first 3 segments
                print(f"  Segment {i+1}: '{segment['text']}' ({segment['start']:.1f}s - {segment['end']:.1f}s)")
        
        return result
    except Exception as e:
        print(f"✗ Transcription failed: {e}")
        return None

def create_mock_audio():
    """Create a simple mock audio file for testing."""
    print("\nCreating mock audio file for testing...")
    
    try:
        # Create a simple WAV file with silence
        import wave
        import struct
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.close()
        
        # Create a simple WAV file (1 second of silence)
        with wave.open(temp_file.name, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(16000)  # 16kHz
            
            # Write 1 second of silence
            silence = struct.pack('<h', 0) * 16000
            wav_file.writeframes(silence)
        
        print(f"✓ Mock audio file created: {temp_file.name}")
        return temp_file.name
    except Exception as e:
        print(f"✗ Failed to create mock audio: {e}")
        return None

def main():
    """Run all Whisper tests."""
    print("Whisper Functionality Test")
    print("=" * 50)
    
    # Test model loading
    model = test_whisper_model_loading()
    if not model:
        print("\n❌ Cannot proceed without Whisper model")
        return
    
    # Try to download sample audio
    audio_file = download_sample_audio()
    
    # If download fails, create mock audio
    if not audio_file:
        print("\nFalling back to mock audio file...")
        audio_file = create_mock_audio()
    
    if not audio_file:
        print("\n❌ Cannot proceed without audio file")
        return
    
    # Test transcription
    result = test_whisper_transcription(model, audio_file)
    
    # Clean up
    try:
        os.unlink(audio_file)
        print(f"\n✓ Cleaned up temporary file: {audio_file}")
    except:
        pass
    
    print("\n" + "=" * 50)
    if result:
        print("✅ Whisper is working correctly!")
        print("The transcription engine is ready to process audio files.")
    else:
        print("❌ Whisper test failed.")
        print("There may be an issue with the Whisper installation.")

if __name__ == "__main__":
    main()
