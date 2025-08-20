#!/usr/bin/env python3
import os
import time
import uuid
from dotenv import load_dotenv
from supabase_service import SupabaseService

def test_captions_table():
    print("🧪 Testing New Captions Table...\n")
    
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
        # Step 1: Create task
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
        
        # Step 2: Test saving captions to new table
        print("\n💾 Step 2: Testing captions table...")
        test_captions = [
            {
                'text': 'Alright so here we are one of the elephants.',
                'startTime': 1.02,
                'endTime': 3.26,
                'confidence': 0.95
            },
            {
                'text': 'The cool thing about these guys is that they have really, really, really long hunts.',
                'startTime': 3.88,
                'endTime': 12.5,
                'confidence': 0.92
            },
            {
                'text': 'And that\'s cool.',
                'startTime': 12.88,
                'endTime': 13.68,
                'confidence': 0.98
            }
        ]
        
        # Save captions using new method
        supabase_service.save_captions(task_id, test_captions)
        print(f"✅ Captions saved to new table")
        
        # Step 3: Test retrieving captions
        print("\n📖 Step 3: Testing caption retrieval...")
        retrieved_captions = supabase_service.get_captions_for_task(task_id)
        print(f"✅ Retrieved {len(retrieved_captions)} captions")
        
        # Display retrieved captions
        print("\n📝 Retrieved captions:")
        for i, caption in enumerate(retrieved_captions):
            print(f"   {i+1}. [{caption['startTime']:.2f}s - {caption['endTime']:.2f}s] {caption['text']}")
            print(f"      Confidence: {caption.get('confidence', 'N/A')}")
        
        # Step 4: Verify database structure
        print("\n🔍 Step 4: Verifying database structure...")
        
        # Check caption_tasks table
        task_result = supabase_service.supabase.table('caption_tasks').select('*').eq('id', task_id).single().execute()
        print(f"✅ Task status: {task_result.data['status']}")
        
        # Check captions table
        captions_result = supabase_service.supabase.table('captions').select('*').eq('task_id', task_id).execute()
        print(f"✅ Captions in table: {len(captions_result.data)}")
        
        # Show table structure
        print("\n📊 Captions table structure:")
        for caption in captions_result.data:
            print(f"   ID: {caption['id']}")
            print(f"   Text: {caption['text'][:50]}...")
            print(f"   Start: {caption['start_time']}s, End: {caption['end_time']}s")
            print(f"   Sequence: {caption['sequence_order']}")
            print(f"   Confidence: {caption['confidence']}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_captions_table()
    if success:
        print("\n🎉 Captions table test PASSED!")
        print("✅ New captions table is working properly")
    else:
        print("\n❌ Captions table test FAILED!")
