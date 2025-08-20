#!/usr/bin/env python3
"""
Test script to verify the API endpoints are working correctly.
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint."""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Health check passed")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def test_process_video():
    """Test starting video processing."""
    print("\nTesting video processing...")
    try:
        data = {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "language": "en"
        }
        response = requests.post(f"{API_BASE_URL}/process", json=data)
        
        if response.status_code == 200:
            result = response.json()
            task_id = result.get("task_id")
            print(f"✓ Video processing started: {task_id}")
            return task_id
        else:
            print(f"✗ Video processing failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Video processing error: {e}")
        return None

def test_status_check(task_id):
    """Test status checking."""
    print(f"\nTesting status check for task: {task_id}")
    try:
        response = requests.get(f"{API_BASE_URL}/status/{task_id}")
        
        if response.status_code == 200:
            status = response.json()
            print(f"✓ Status check passed: {status['status']}")
            print(f"  Progress: {status.get('progress', 0)}%")
            print(f"  Message: {status.get('message', 'N/A')}")
            return status
        else:
            print(f"✗ Status check failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"✗ Status check error: {e}")
        return None

def test_get_captions(task_id):
    """Test getting captions."""
    print(f"\nTesting captions retrieval for task: {task_id}")
    try:
        response = requests.get(f"{API_BASE_URL}/captions/{task_id}")
        
        if response.status_code == 200:
            result = response.json()
            captions = result.get("captions", [])
            print(f"✓ Captions retrieved: {len(captions)} captions")
            
            if captions:
                print("  Sample captions:")
                for i, caption in enumerate(captions[:3]):  # Show first 3
                    print(f"    {i+1}. {caption['text']} ({caption['startTime']:.1f}s - {caption['endTime']:.1f}s)")
            
            return captions
        else:
            print(f"✗ Captions retrieval failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Captions retrieval error: {e}")
        return None

def main():
    """Run all API tests."""
    print("API Endpoint Test")
    print("=" * 50)
    
    # Test health endpoint
    if not test_health():
        print("\n❌ Health check failed. Make sure the server is running.")
        return
    
    # Test video processing
    task_id = test_process_video()
    if not task_id:
        print("\n❌ Video processing failed.")
        return
    
    # Wait a moment for processing to start
    print("\nWaiting for processing to start...")
    time.sleep(2)
    
    # Test status check
    status = test_status_check(task_id)
    if not status:
        print("\n❌ Status check failed.")
        return
    
    # If processing is still ongoing, wait and check again
    if status['status'] == 'processing':
        print("\nProcessing is ongoing. Waiting for completion...")
        max_wait = 60  # Wait up to 60 seconds
        wait_time = 0
        
        while wait_time < max_wait:
            time.sleep(5)
            wait_time += 5
            
            status = test_status_check(task_id)
            if status and status['status'] == 'completed':
                break
            elif status and status['status'] == 'failed':
                print("❌ Processing failed.")
                return
        
        if wait_time >= max_wait:
            print("⚠️ Processing is taking longer than expected.")
            print("You can check the status manually later.")
    
    # Test captions retrieval
    captions = test_get_captions(task_id)
    
    print("\n" + "=" * 50)
    if captions:
        print("✅ API tests completed successfully!")
        print(f"Retrieved {len(captions)} captions from the video.")
    else:
        print("⚠️ API tests completed with warnings.")
        print("Captions may still be processing or there was an issue.")
    
    print(f"\nTask ID for manual testing: {task_id}")
    print(f"Check status: curl {API_BASE_URL}/status/{task_id}")
    print(f"Get captions: curl {API_BASE_URL}/captions/{task_id}")

if __name__ == "__main__":
    main()
