#!/usr/bin/env python3
"""
Test script to verify fast API integration with a real YouTube video.
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_fast_api_with_real_video():
    """Test fast API transcription with a real YouTube video."""
    print("🧪 Testing Fast API with Real YouTube Video")
    print("=" * 50)
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        # Test video URL (short video for testing)
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # "Me at the zoo" - first YouTube video
        
        print(f"🎬 Testing with video: {test_url}")
        print(f"📝 This is the first YouTube video ever uploaded (18 seconds)")
        
        # Initialize transcriber with fast API
        print("\n🚀 Initializing transcriber with fast API...")
        transcriber = YouTubeTranscriber(model_size="base", use_fast_api=True)
        
        # Process the video
        print("\n🔄 Processing video...")
        start_time = time.time()
        
        result = transcriber.process_video(test_url, "en")
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        if result and result.get('captions'):
            print(f"\n✅ SUCCESS! Video processed in {processing_time:.2f} seconds")
            print(f"📝 Generated {len(result['captions'])} captions")
            print(f"🎬 Video title: {result.get('title', 'Unknown')}")
            print(f"⏱️ Video duration: {result.get('duration', 0)} seconds")
            
            # Show first few captions
            print(f"\n📄 First 3 captions:")
            for i, caption in enumerate(result['captions'][:3]):
                print(f"  {i+1}. [{caption['startTime']:.2f}s - {caption['endTime']:.2f}s] {caption['text']}")
            
            # Performance analysis
            if processing_time < 60:
                print(f"\n🚀 FAST API WORKING! Processing time: {processing_time:.2f}s")
                print(f"   This is much faster than local processing (would take 2-5 minutes)")
            else:
                print(f"\n📦 Local fallback used. Processing time: {processing_time:.2f}s")
            
            return True
            
        else:
            print(f"\n❌ FAILED: No captions generated")
            print(f"   Processing time: {processing_time:.2f}s")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

def test_local_fallback():
    """Test local Whisper model as fallback."""
    print("\n🧪 Testing Local Whisper Fallback")
    print("=" * 50)
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        # Test video URL
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
        
        print(f"🎬 Testing with video: {test_url}")
        
        # Initialize transcriber with local model only
        print("\n📦 Initializing transcriber with local model...")
        transcriber = YouTubeTranscriber(model_size="tiny", use_fast_api=False)
        
        # Process the video
        print("\n🔄 Processing video...")
        start_time = time.time()
        
        result = transcriber.process_video(test_url, "en")
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        if result and result.get('captions'):
            print(f"\n✅ SUCCESS! Local processing completed in {processing_time:.2f} seconds")
            print(f"📝 Generated {len(result['captions'])} captions")
            return True
        else:
            print(f"\n❌ FAILED: No captions generated")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("Fast API Integration Test with Real YouTube Video")
    print("=" * 60)
    
    # Test fast API
    fast_api_success = test_fast_api_with_real_video()
    
    # Test local fallback
    local_success = test_local_fallback()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    print(f"Fast API Test: {'✅ PASS' if fast_api_success else '❌ FAIL'}")
    print(f"Local Fallback Test: {'✅ PASS' if local_success else '❌ FAIL'}")
    
    if fast_api_success and local_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("🚀 Fast API integration is working correctly with real videos!")
        print("\nYour system is ready for production use.")
    elif local_success:
        print("\n⚠️ Local processing works, but fast API needs attention.")
        print("Check your OpenAI API key and internet connection.")
    else:
        print("\n❌ Tests failed. Check the error messages above.")
        print("Make sure all dependencies are installed correctly.")

if __name__ == "__main__":
    main()
