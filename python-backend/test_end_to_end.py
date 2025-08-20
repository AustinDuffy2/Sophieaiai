#!/usr/bin/env python3
import os
import time
import uuid
from dotenv import load_dotenv
from supabase_service import SupabaseService
from youtube_transcriber import YouTubeTranscriber

def test_end_to_end_flow():
    print("🧪 Testing Complete End-to-End Flow...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Initialize services
    supabase_service = SupabaseService()
    transcriber = YouTubeTranscriber(model_size="base")
    
    # Test video URL (a short video for testing)
    test_video_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # "Me at the zoo" - YouTube's first video
    test_language = "en"
    
    print(f"🎬 Test Video: {test_video_url}")
    print(f"🌍 Language: {test_language}")
    print(f"🆔 Test ID: {uuid.uuid4()}")
    print()
    
    try:
        # Step 1: Create a task in Supabase (simulating React Native app)
        print("📝 Step 1: Creating task in Supabase...")
        task_id = str(uuid.uuid4())
        
        # Insert task directly (simulating what React Native does)
        result = supabase_service.supabase.table('caption_tasks').insert([
            {
                'id': task_id,
                'video_url': test_video_url,
                'language': test_language,
                'status': 'pending'
            }
        ]).execute()
        
        print(f"✅ Task created with ID: {task_id}")
        
        # Step 2: Update status to processing (simulating backend)
        print("\n🔄 Step 2: Updating status to processing...")
        supabase_service.update_task_status(task_id, 'processing')
        print("✅ Status updated to processing")
        
        # Step 3: Process the video (actual backend work)
        print("\n🎵 Step 3: Processing video...")
        print("   - Downloading video...")
        print("   - Extracting audio...")
        print("   - Transcribing with Whisper...")
        
        # Process the video
        result = transcriber.process_video(test_video_url, test_language)
        
        if result and result.get('captions'):
            captions = result['captions']
            print(f"✅ Transcription complete! Generated {len(captions)} captions")
            
            # Step 4: Save captions to Supabase
            print("\n💾 Step 4: Saving captions to Supabase...")
            supabase_service.save_captions(task_id, captions)
            print("✅ Captions saved to database")
            
            # Step 5: Verify the task is completed
            print("\n🔍 Step 5: Verifying task completion...")
            task_result = supabase_service.supabase.table('caption_tasks').select('*').eq('id', task_id).single().execute()
            
            if task_result.data['status'] == 'completed':
                print("✅ Task status: completed")
                print(f"✅ Captions count: {len(task_result.data['captions'])}")
                
                # Show first few captions
                print("\n📝 Sample captions:")
                for i, caption in enumerate(task_result.data['captions'][:3]):
                    print(f"   {i+1}. [{caption['startTime']:.1f}s - {caption['endTime']:.1f}s] {caption['text']}")
                
                print("\n🎉 END-TO-END TEST PASSED!")
                print("✅ Complete flow working: Task Creation → Processing → Caption Generation → Database Storage")
                return True
            else:
                print(f"❌ Task status is {task_result.data['status']}, expected 'completed'")
                return False
        else:
            print("❌ No captions generated")
            supabase_service.update_task_status(task_id, 'failed', 'No captions generated')
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
    finally:
        # Cleanup
        try:
            transcriber.cleanup()
        except:
            pass

if __name__ == "__main__":
    print("🚀 Starting End-to-End Test")
    print("=" * 50)
    
    success = test_end_to_end_flow()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ALL TESTS PASSED! Backend is ready for production.")
    else:
        print("❌ TESTS FAILED! Please check the errors above.")
    
    print("\n💡 This test simulates the complete flow:")
    print("   1. React Native creates task in Supabase")
    print("   2. Backend processes the task")
    print("   3. Video is downloaded and transcribed")
    print("   4. Captions are saved to Supabase")
    print("   5. React Native can fetch the captions")
