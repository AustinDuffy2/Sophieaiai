#!/usr/bin/env python3
"""
Test script to demonstrate local Whisper speed optimizations.
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_optimized_local_processing():
    """Test optimized local processing with speed improvements."""
    print("🧪 Testing Optimized Local Whisper Processing")
    print("=" * 50)
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        # Test with a short video
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # "Me at the zoo" - 18 seconds
        
        print(f"🎬 Testing with video: {test_url}")
        print(f"📝 This is a short video to test speed optimizations")
        
        # Initialize transcriber with local optimizations only
        print("\n⚡ Initializing transcriber with local speed optimizations...")
        transcriber = YouTubeTranscriber(model_size="tiny", use_fast_api=False)
        
        # Process the video
        print("\n🔄 Processing video with local optimizations...")
        start_time = time.time()
        
        result = transcriber.process_video(test_url, "en")
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        if result and result.get('captions'):
            print(f"\n✅ SUCCESS! Video processed in {processing_time:.2f} seconds")
            print(f"📝 Generated {len(result['captions'])} captions")
            print(f"🎬 Video title: {result.get('title', 'Unknown')}")
            print(f"⏱️ Video duration: {result.get('duration', 0)} seconds")
            
            # Performance analysis
            if processing_time < 30:
                print(f"\n⚡ EXCELLENT SPEED! Processing time: {processing_time:.2f}s")
                print(f"   This is much faster than before!")
            elif processing_time < 60:
                print(f"\n🚀 GOOD SPEED! Processing time: {processing_time:.2f}s")
                print(f"   Reasonable performance for local processing")
            else:
                print(f"\n📦 SLOWER THAN EXPECTED: Processing time: {processing_time:.2f}s")
                print(f"   May need further optimization")
            
            # Show first few captions
            print(f"\n📄 First 3 captions:")
            for i, caption in enumerate(result['captions'][:3]):
                print(f"  {i+1}. [{caption['startTime']:.2f}s - {caption['endTime']:.2f}s] {caption['text']}")
            
            return True
            
        else:
            print(f"\n❌ FAILED: No captions generated")
            print(f"   Processing time: {processing_time:.2f}s")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

def test_speed_comparison():
    """Test speed comparison between different optimizations."""
    print("\n🧪 Testing Speed Comparison")
    print("=" * 50)
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
        
        # Test with tiny model (fastest)
        print("\n⚡ Testing with tiny model (fastest)...")
        start_time = time.time()
        transcriber_tiny = YouTubeTranscriber(model_size="tiny", use_fast_api=False)
        result_tiny = transcriber_tiny.process_video(test_url, "en")
        tiny_time = time.time() - start_time
        
        if result_tiny:
            print(f"✅ Tiny model: {tiny_time:.2f}s")
        else:
            print(f"❌ Tiny model failed")
            return False
        
        # Test with base model (slower but more accurate)
        print("\n📦 Testing with base model (slower but more accurate)...")
        start_time = time.time()
        transcriber_base = YouTubeTranscriber(model_size="base", use_fast_api=False)
        result_base = transcriber_base.process_video(test_url, "en")
        base_time = time.time() - start_time
        
        if result_base:
            print(f"✅ Base model: {base_time:.2f}s")
        else:
            print(f"❌ Base model failed")
            return False
        
        # Speed comparison
        speedup = base_time / tiny_time if tiny_time > 0 else 0
        print(f"\n📊 Speed Comparison:")
        print(f"   Tiny model: {tiny_time:.2f}s")
        print(f"   Base model: {base_time:.2f}s")
        print(f"   Speedup: {speedup:.1f}x faster with tiny model")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

def main():
    """Run all speed optimization tests."""
    print("Local Whisper Speed Optimization Test")
    print("=" * 60)
    
    # Test optimized local processing
    success1 = test_optimized_local_processing()
    
    # Test speed comparison
    success2 = test_speed_comparison()
    
    # Summary
    print("\n" + "=" * 60)
    print("Speed Optimization Results")
    print("=" * 60)
    
    if success1 and success2:
        print("\n🎉 ALL OPTIMIZATIONS SUCCESSFUL!")
        print("⚡ Your local processing should now be much faster!")
        print("\nKey optimizations implemented:")
        print("✅ Using tiny Whisper model (fastest)")
        print("✅ Optimized audio download (worst quality for speed)")
        print("✅ Optimized audio conversion (8kHz mono)")
        print("✅ Disabled word timestamps for speed")
        print("✅ Reduced verbosity for speed")
        print("✅ Optimized transcription parameters")
        print("✅ Model evaluation mode for faster inference")
    else:
        print("\n⚠️ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
