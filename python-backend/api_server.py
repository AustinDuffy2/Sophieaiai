from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from youtube_transcriber import YouTubeTranscriber
from supabase_service import SupabaseService
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

# Initialize Supabase service
supabase_service = SupabaseService()

def process_pending_tasks():
    """Background task to process pending tasks from Supabase"""
    print("🔄 Background processor started - checking for tasks every 5 seconds")
    while True:
        try:
            # Get pending tasks from Supabase
            pending_tasks = supabase_service.get_pending_tasks()
            print(f"📊 Found {len(pending_tasks)} pending tasks")
            
            for task in pending_tasks:
                print(f"🔄 Processing task: {task['id']}")
                print(f"   Video URL: {task['video_url']}")
                print(f"   Language: {task['language']}")
                
                try:
                    # Update status to processing
                    print(f"   Updating status to 'processing'...")
                    supabase_service.update_task_status(task['id'], 'processing')
                    
                    # Initialize transcriber
                    print(f"   Initializing transcriber...")
                    transcriber = YouTubeTranscriber(model_size="base")
                    
                    # Process video
                    print(f"   Processing video...")
                    result = transcriber.process_video(task['video_url'], task['language'])
                    
                    if result and result.get('captions'):
                        # Save captions to Supabase
                        print(f"   Saving {len(result['captions'])} captions...")
                        supabase_service.save_captions(task['id'], result['captions'])
                        print(f"✅ Task {task['id']} completed successfully")
                    else:
                        # Update status to failed
                        print(f"   No captions generated, marking as failed")
                        supabase_service.update_task_status(
                            task['id'], 
                            'failed', 
                            'No captions generated'
                        )
                        print(f"❌ Task {task['id']} failed - no captions")
                    
                    # Clean up
                    transcriber.cleanup()
                    
                except Exception as e:
                    print(f"❌ Error processing task {task['id']}: {e}")
                    print(f"   Error details: {str(e)}")
                    supabase_service.update_task_status(
                        task['id'], 
                        'failed', 
                        str(e)
                    )
            
            # Wait before checking for new tasks
            print(f"⏰ Waiting 5 seconds before next check...")
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ Error in background processor: {e}")
            print(f"   Error details: {str(e)}")
            time.sleep(10)

# Start background processor
processor_thread = threading.Thread(target=process_pending_tasks, daemon=True)
processor_thread.start()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'message': 'Backend processing tasks from Supabase'
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get processing statistics."""
    try:
        pending_tasks = supabase_service.get_pending_tasks()
        return jsonify({
            'pending_tasks': len(pending_tasks),
            'status': 'running'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Matric Backend - Supabase Integration")
    print("📊 Processing tasks from Supabase database")
    print("🔄 Background processor started")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)
