from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from youtube_transcriber import YouTubeTranscriber
from supabase_service import SupabaseService
import threading
import time
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

# Initialize Supabase service
supabase_service = SupabaseService()

# In-memory task storage for direct API calls
tasks = {}

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
                    
                    # Initialize transcriber with fast API enabled and optimized for speed
                    print(f"   Initializing transcriber with fast API and speed optimizations...")
                    transcriber = YouTubeTranscriber(model_size="tiny", use_fast_api=True)
                    
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

@app.route('/process', methods=['POST'])
def process_video():
    """Start video processing."""
    try:
        data = request.get_json()
        print(f"📥 Received data: {data}")
        
        url = data.get('url')
        language = data.get('language', 'en')
        
        print(f"🔗 URL: {url}")
        print(f"🌍 Language: {language}")
        
        if not url:
            print("❌ No URL provided")
            return jsonify({'error': 'URL is required'}), 400
        
        # Generate task ID
        task_id = str(uuid.uuid4())
        
        # Initialize task
        tasks[task_id] = {
            'status': 'pending',
            'url': url,
            'language': language,
            'progress': 0,
            'message': 'Initializing...',
            'captions': None,
            'error': None
        }
        
        # Start processing in background
        def process_task():
            try:
                tasks[task_id]['status'] = 'processing'
                tasks[task_id]['message'] = 'Processing video...'
                tasks[task_id]['progress'] = 25
                
                # Initialize transcriber with fast API enabled and optimized for speed
                transcriber = YouTubeTranscriber(model_size="tiny", use_fast_api=True)
                
                tasks[task_id]['progress'] = 50
                tasks[task_id]['message'] = 'Transcribing audio...'
                
                # Process video
                print(f"🎬 Processing video with URL: {url}")
                result = transcriber.process_video(url, language)
                print(f"📝 Processing result: {result}")
                
                if result and result.get('captions'):
                    tasks[task_id]['status'] = 'completed'
                    tasks[task_id]['progress'] = 100
                    tasks[task_id]['message'] = 'Completed successfully'
                    tasks[task_id]['captions'] = result['captions']
                    print(f"✅ Task {task_id} completed with {len(result['captions'])} captions")
                else:
                    tasks[task_id]['status'] = 'failed'
                    tasks[task_id]['error'] = 'No captions generated'
                    print(f"❌ Task {task_id} failed - no captions")
                
                # Clean up
                transcriber.cleanup()
                
            except Exception as e:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = str(e)
                print(f"❌ Task {task_id} failed: {e}")
        
        # Start processing in background thread
        thread = threading.Thread(target=process_task)
        thread.daemon = True
        thread.start()
        
        # Add timeout for the task
        def timeout_task():
            time.sleep(300)  # 5 minutes timeout
            if task_id in tasks and tasks[task_id]['status'] == 'processing':
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = 'Processing timeout - took too long'
                print(f"⏰ Task {task_id} timed out after 5 minutes")
        
        timeout_thread = threading.Thread(target=timeout_task)
        timeout_thread.daemon = True
        timeout_thread.start()
        
        return jsonify({'task_id': task_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/status/<task_id>', methods=['GET'])
def get_status(task_id):
    """Get processing status."""
    try:
        if task_id not in tasks:
            return jsonify({'error': 'Task not found'}), 404
        
        task = tasks[task_id]
        return jsonify({
            'status': task['status'],
            'progress': task['progress'],
            'message': task['message'],
            'error': task['error']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/captions/<task_id>', methods=['GET'])
def get_captions(task_id):
    """Get completed captions."""
    try:
        if task_id not in tasks:
            return jsonify({'error': 'Task not found'}), 404
        
        task = tasks[task_id]
        
        if task['status'] != 'completed':
            return jsonify({'error': 'Task not completed'}), 400
        
        if not task['captions']:
            return jsonify({'error': 'No captions available'}), 400
        
        return jsonify({'captions': task['captions']})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'message': 'Backend processing tasks from Supabase and direct API'
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
