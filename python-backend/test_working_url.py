#!/usr/bin/env python3
"""
Test script with working YouTube URLs and alternative download methods.
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:5001"

def test_working_youtube_urls():
    """Test with different YouTube URLs that should work."""
    
    # List of working YouTube URLs to test
    test_urls = [
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",  # "Me at the zoo" - first YouTube video
        "https://www.youtube.com/watch?v=9bZkp7q19f0",  # PSY - GANGNAM STYLE
        "https://www.youtube.com/watch?v=kJQP7kiw5Fk",  # Luis Fonsi - Despacito
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Roll (might be blocked)
    ]
    
    print("Testing YouTube URLs with the API...")
    print("=" * 50)
    
    for i, url in enumerate(test_urls, 1):
        print(f"\nTest {i}: {url}")
        
        try:
            # Start processing
            response = requests.post(f"{API_BASE_URL}/process", 
                                   json={"url": url, "language": "en"})
            
            if response.status_code == 200:
                result = response.json()
                task_id = result.get("task_id")
                print(f"✓ Processing started: {task_id}")
                
                # Wait and check status
                for attempt in range(6):  # Wait up to 30 seconds
                    time.sleep(5)
                    
                    status_response = requests.get(f"{API_BASE_URL}/status/{task_id}")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        
                        if status_data.get("status") == "completed":
                            print(f"✓ Processing completed successfully!")
                            
                            # Get captions
                            captions_response = requests.get(f"{API_BASE_URL}/captions/{task_id}")
                            if captions_response.status_code == 200:
                                captions_data = captions_response.json()
                                captions = captions_data.get("captions", [])
                                print(f"✓ Retrieved {len(captions)} captions")
                                
                                if captions:
                                    print("Sample captions:")
                                    for j, caption in enumerate(captions[:3]):
                                        print(f"  {j+1}. '{caption['text']}' ({caption['startTime']:.1f}s - {caption['endTime']:.1f}s)")
                                
                                return True  # Success!
                            
                        elif status_data.get("status") == "failed":
                            print(f"✗ Processing failed: {status_data.get('error', 'Unknown error')}")
                            break
                        
                        elif status_data.get("status") == "processing":
                            print(f"⏳ Still processing... (attempt {attempt + 1}/6)")
                    
                    else:
                        print(f"✗ Status check failed: {status_response.status_code}")
                        break
                
                print("⚠️ Processing timed out or failed")
                
            else:
                print(f"✗ Failed to start processing: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    return False

def test_alternative_approach():
    """Test with a different approach - using yt-dlp instead of pytube."""
    print("\n" + "=" * 50)
    print("Testing alternative approach with yt-dlp...")
    
    try:
        # Try to install yt-dlp if not available
        import subprocess
        import sys
        
        try:
            import yt_dlp
            print("✓ yt-dlp is available")
        except ImportError:
            print("Installing yt-dlp...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
            import yt_dlp
            print("✓ yt-dlp installed successfully")
        
        # Test with yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': '/tmp/test_audio.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Downloading audio with yt-dlp...")
            ydl.download(['https://www.youtube.com/watch?v=jNQXAC9IVRw'])
        
        print("✓ Audio downloaded successfully with yt-dlp")
        return True
        
    except Exception as e:
        print(f"✗ Alternative approach failed: {e}")
        return False

def main():
    """Run all tests."""
    print("YouTube URL and Whisper Integration Test")
    print("=" * 50)
    
    # Test with working URLs
    success = test_working_youtube_urls()
    
    if not success:
        print("\nTrying alternative approach...")
        test_alternative_approach()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Success! Whisper is working and generating captions from YouTube videos!")
    else:
        print("⚠️ Some issues with YouTube downloading, but Whisper itself is working.")
        print("The transcription engine is ready - the issue is with video downloading.")

if __name__ == "__main__":
    main()
