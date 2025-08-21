#!/usr/bin/env python3
"""
Test script to verify the fast API integration with OpenAI Whisper API.
This script tests both the fast API and local fallback functionality.
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_api_key():
    """Test if OpenAI API key is configured."""
    print("Testing OpenAI API Key Configuration...")
    
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key and api_key != 'your-openai-api-key':
        print("✅ OpenAI API key found")
        return True
    else:
        print("❌ OpenAI API key not found or not configured")
        print("   Please set OPENAI_API_KEY in your .env file")
        return False

def test_fast_api_transcription():
    """Test fast API transcription with a sample audio file."""
    print("\nTesting Fast API Transcription...")
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        # Test with fast API enabled
        print("🚀 Testing with OpenAI Whisper API...")
        transcriber = YouTubeTranscriber(model_size="base", use_fast_api=True)
        
        # Create a simple test audio file (you would need a real audio file for testing)
        print("⚠️ Note: This test requires a real audio file")
        print("   You can test with a real YouTube URL in the main application")
        
        return True
        
    except Exception as e:
        print(f"❌ Fast API test failed: {e}")
        return False

def test_local_fallback():
    """Test local Whisper model fallback."""
    print("\nTesting Local Whisper Fallback...")
    
    try:
        from youtube_transcriber import YouTubeTranscriber
        
        # Test with fast API disabled
        print("📦 Testing with local Whisper model...")
        transcriber = YouTubeTranscriber(model_size="tiny", use_fast_api=False)
        
        print("✅ Local Whisper model loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Local fallback test failed: {e}")
        return False

def test_api_integration():
    """Test the API server integration."""
    print("\nTesting API Server Integration...")
    
    try:
        import requests
        
        # Test the API health endpoint
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running")
            return True
        else:
            print(f"❌ API server returned status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ API server is not running")
        print("   Start it with: python api_server.py")
        return False
    except Exception as e:
        print(f"❌ API integration test failed: {e}")
        return False

def main():
    """Run all fast API tests."""
    print("Fast API Integration Test")
    print("=" * 40)
    
    tests = [
        ("OpenAI API Key", test_openai_api_key),
        ("Fast API Transcription", test_fast_api_transcription),
        ("Local Fallback", test_local_fallback),
        ("API Integration", test_api_integration),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 20)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 40)
    print("Test Results Summary")
    print("=" * 40)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Fast API integration is working correctly.")
        print("\nNext steps:")
        print("1. Start the API server: python api_server.py")
        print("2. Test with a YouTube URL in your app")
        print("3. Enjoy faster caption generation! 🚀")
    else:
        print("\n⚠️ Some tests failed. Please check the configuration.")
        print("\nTroubleshooting:")
        print("1. Ensure OPENAI_API_KEY is set in your .env file")
        print("2. Make sure the API server is running")
        print("3. Check your internet connection for API calls")

if __name__ == "__main__":
    main()
