#!/usr/bin/env python3
import os
import time
import uuid
from dotenv import load_dotenv
from supabase_service import SupabaseService

def test_manual_task():
    print("🧪 Testing Manual Task Creation and Processing...\n")
    
    load_dotenv()
    supabase_service = SupabaseService()
    
    # Test video URL
    test_video_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    test_language = "en"
    task_id = str(uuid.uuid4())
    
    print(f"🎬 Test Video: {test_video_url}")
    print(f"🌍 Language: {test_language}")
    print(f"🆔 Task ID: {task_id}")
    print()
    
    try:
        # Step 1: Create task manually
        print("📝 Step 1: Creating task in Supabase...")
        result = supabase_service.supabase.table('caption_tasks').insert([
            {
                'id': task_id,
                'video_url': test_video_url,
                'language': test_language,
                'status': 'pending'
            }
        ]).execute()
        
        print(f"✅ Task created successfully")
        
        # Step 2: Monitor task status
        print("\n📊 Step 2: Monitoring task status...")
        for i in range(30):  # Monitor for up to 60 seconds
            try:
                task_result = supabase_service.supabase.table('caption_tasks').select('*').eq('id', task_id).single().execute()
                status = task_result.data['status']
                print(f"   [{i+1:2d}] Status: {status}")
                
                if status == 'completed':
                    print(f"✅ Task completed! Captions count: {len(task_result.data.get('captions', []))}")
                    if task_result.data.get('captions'):
                        print("📝 Sample captions:")
                        for j, caption in enumerate(task_result.data['captions'][:3]):
                            print(f"   {j+1}. [{caption['startTime']:.1f}s - {caption['endTime']:.1f}s] {caption['text']}")
                    return True
                elif status == 'failed':
                    print(f"❌ Task failed: {task_result.data.get('error_message', 'Unknown error')}")
                    return False
                    
            except Exception as e:
                print(f"   [{i+1:2d}] Error checking status: {e}")
                
            time.sleep(2)
        
        print("⏰ Timeout - task didn't complete within 60 seconds")
        return False
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_manual_task()
    if success:
        print("\n🎉 Manual task test PASSED!")
    else:
        print("\n❌ Manual task test FAILED!")
