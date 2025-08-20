import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    def update_task_status(self, task_id: str, status: str, error_message: str = None):
        """Update task status in Supabase"""
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            if error_message:
                update_data['error_message'] = error_message
            
            result = self.supabase.table('caption_tasks').update(update_data).eq('id', task_id).execute()
            print(f"✅ Updated task {task_id} status to {status}")
            return result
        except Exception as e:
            print(f"❌ Error updating task status: {e}")
            raise
    
    def save_captions(self, task_id: str, captions: list):
        """Save captions to Supabase using the dedicated captions table"""
        try:
            # First, update the task status to completed
            update_data = {
                'status': 'completed',
                'updated_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('caption_tasks').update(update_data).eq('id', task_id).execute()
            print(f"✅ Updated task {task_id} status to completed")
            
            # Then, save captions to the dedicated captions table
            if captions and len(captions) > 0:
                # Clean and validate captions before saving
                cleaned_captions = []
                for caption in captions:
                    cleaned_caption = {
                        'text': caption.get('text', ''),
                        'startTime': float(caption.get('startTime', 0)),
                        'endTime': float(caption.get('endTime', 0)),
                        'confidence': self.validate_confidence(caption.get('confidence', 0))
                    }
                    cleaned_captions.append(cleaned_caption)
                
                # Use the database function to insert captions
                result = self.supabase.rpc('insert_captions_for_task', {
                    'task_uuid': task_id,
                    'captions_data': cleaned_captions
                }).execute()
                
                print(f"✅ Saved {len(cleaned_captions)} captions to captions table for task {task_id}")
            else:
                print(f"⚠️ No captions to save for task {task_id}")
                
            return result
        except Exception as e:
            print(f"❌ Error saving captions: {e}")
            raise
    
    def validate_confidence(self, confidence):
        """Validate and clean confidence values"""
        try:
            conf = float(confidence)
            # Ensure confidence is within valid range (-1 to 1)
            if conf < -1:
                return -1.0
            elif conf > 1:
                return 1.0
            return conf
        except (ValueError, TypeError):
            return 0.0
    
    def get_pending_tasks(self):
        """Get all pending tasks from Supabase"""
        try:
            result = self.supabase.table('caption_tasks').select('*').eq('status', 'pending').execute()
            return result.data
        except Exception as e:
            print(f"❌ Error getting pending tasks: {e}")
            return []
    
    def get_captions_for_task(self, task_id: str):
        """Get captions for a specific task from the captions table"""
        try:
            result = self.supabase.rpc('get_captions_for_task', {
                'task_uuid': task_id
            }).execute()
            
            # Convert the result to the expected format
            captions = []
            for row in result.data:
                captions.append({
                    'id': row['id'],
                    'text': row['text'],
                    'startTime': float(row['start_time']),
                    'endTime': float(row['end_time']),
                    'confidence': float(row['confidence']) if row['confidence'] else None
                })
            
            return captions
        except Exception as e:
            print(f"❌ Error getting captions for task {task_id}: {e}")
            return []
    
    def check_existing_captions(self, video_url: str):
        """Check if we already have captions for a video URL"""
        try:
            # First, normalize the URL to handle different YouTube URL formats
            normalized_url = self.normalize_youtube_url(video_url)
            
            # Check for completed tasks with this video URL
            result = self.supabase.table('caption_tasks').select('id, status').eq('video_url', normalized_url).eq('status', 'completed').execute()
            
            if result.data and len(result.data) > 0:
                # Get the most recent completed task
                task_id = result.data[0]['id']
                print(f"✅ Found existing captions for video: {normalized_url}")
                return task_id
            
            return None
        except Exception as e:
            print(f"❌ Error checking existing captions: {e}")
            return None
    
    def normalize_youtube_url(self, url: str):
        """Normalize YouTube URL to handle different formats"""
        # Remove playlist parameters and other extras
        if '&list=' in url:
            url = url.split('&list=')[0]
        if '&index=' in url:
            url = url.split('&index=')[0]
        if '&start_radio=' in url:
            url = url.split('&start_radio=')[0]
        
        # Convert mobile URLs to desktop
        if 'm.youtube.com' in url:
            url = url.replace('m.youtube.com', 'www.youtube.com')
        
        return url
