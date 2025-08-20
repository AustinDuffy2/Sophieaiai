import os
import re
from typing import Optional, Dict, Any
from urllib.parse import urlparse, parse_qs
import whisper
import yt_dlp
from pydub import AudioSegment
import tempfile
import json
from datetime import datetime

class YouTubeTranscriber:
    def __init__(self, model_size: str = "base"):
        """
        Initialize the YouTube transcriber with Whisper model.
        
        Args:
            model_size (str): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model = whisper.load_model(model_size)
        self.temp_dir = tempfile.mkdtemp()
        
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract YouTube video ID from various URL formats.
        
        Args:
            url (str): YouTube URL
            
        Returns:
            str: Video ID or None if invalid
        """
        # Handle different YouTube URL formats
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def download_audio(self, url: str) -> Optional[str]:
        """
        Download audio from YouTube video using yt-dlp.
        
        Args:
            url (str): YouTube video URL
            
        Returns:
            str: Path to downloaded audio file or None if failed
        """
        try:
            print(f"Downloading audio from: {url}")
            
            # Create temporary file path
            audio_path = os.path.join(self.temp_dir, "audio.%(ext)s")
            
            # Configure yt-dlp options
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': audio_path,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                }],
                'quiet': True,
            }
            
            # Download audio
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Get video info
                info = ydl.extract_info(url, download=False)
                print(f"Video Title: {info.get('title', 'Unknown')}")
                print(f"Video Duration: {info.get('duration', 0)} seconds")
                
                # Download the audio
                ydl.download([url])
            
            # Find the actual downloaded file
            wav_path = os.path.join(self.temp_dir, "audio.wav")
            if os.path.exists(wav_path):
                print(f"Audio downloaded to: {wav_path}")
                return wav_path
            else:
                print("Audio file not found after download")
                return None
            
        except Exception as e:
            print(f"Error downloading audio: {str(e)}")
            return None
    
    def convert_to_wav(self, audio_path: str) -> Optional[str]:
        """
        Convert audio file to WAV format for better Whisper compatibility.
        
        Args:
            audio_path (str): Path to audio file
            
        Returns:
            str: Path to WAV file or None if failed
        """
        try:
            print("Converting audio to WAV format...")
            
            # Load audio with pydub
            audio = AudioSegment.from_file(audio_path)
            
            # Convert to WAV
            wav_path = os.path.join(self.temp_dir, "audio.wav")
            audio.export(wav_path, format="wav")
            
            print(f"Audio converted to: {wav_path}")
            return wav_path
            
        except Exception as e:
            print(f"Error converting audio: {str(e)}")
            return None
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Optional[Dict[str, Any]]:
        """
        Transcribe audio using OpenAI Whisper.
        
        Args:
            audio_path (str): Path to audio file
            language (str): Language code (e.g., 'en', 'es', 'fr')
            
        Returns:
            dict: Transcription result with segments and metadata
        """
        try:
            print(f"Transcribing audio in {language}...")
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=True,
                word_timestamps=True
            )
            
            print("Transcription completed successfully!")
            return result
            
        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
            return None
    
    def format_captions(self, transcription: Dict[str, Any]) -> list:
        """
        Format transcription result into caption segments.
        
        Args:
            transcription (dict): Whisper transcription result
            
        Returns:
            list: List of caption segments with timing
        """
        captions = []
        
        if 'segments' in transcription:
            for i, segment in enumerate(transcription['segments']):
                caption = {
                    'id': i + 1,
                    'text': segment['text'].strip(),
                    'startTime': segment['start'],
                    'endTime': segment['end'],
                    'confidence': segment.get('avg_logprob', 0)
                }
                captions.append(caption)
        
        return captions
    
    def process_video(self, url: str, language: str = "en") -> Optional[Dict[str, Any]]:
        """
        Complete pipeline: download, convert, and transcribe YouTube video.
        
        Args:
            url (str): YouTube video URL
            language (str): Language code for transcription
            
        Returns:
            dict: Complete result with video info and captions
        """
        try:
            # Extract video ID
            video_id = self.extract_video_id(url)
            if not video_id:
                print("Invalid YouTube URL")
                return None
            
            # Download audio
            audio_path = self.download_audio(url)
            if not audio_path:
                return None
            
            # Convert to WAV
            wav_path = self.convert_to_wav(audio_path)
            if not wav_path:
                return None
            
            # Transcribe
            transcription = self.transcribe_audio(wav_path, language)
            if not transcription:
                return None
            
            # Format captions
            captions = self.format_captions(transcription)
            
            # Get video info using yt-dlp
            with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
                info = ydl.extract_info(url, download=False)
            
            result = {
                'video_id': video_id,
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'language': language,
                'captions': captions,
                'transcription': transcription,
                'processed_at': datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            print(f"Error processing video: {str(e)}")
            return None
    
    def save_result(self, result: Dict[str, Any], filename: str = None) -> str:
        """
        Save transcription result to JSON file.
        
        Args:
            result (dict): Transcription result
            filename (str): Optional filename
            
        Returns:
            str: Path to saved file
        """
        if not filename:
            filename = f"transcription_{result['video_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        filepath = os.path.join(self.temp_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"Result saved to: {filepath}")
        return filepath
    
    def cleanup(self):
        """Clean up temporary files."""
        import shutil
        try:
            shutil.rmtree(self.temp_dir)
            print("Temporary files cleaned up")
        except Exception as e:
            print(f"Error cleaning up: {str(e)}")

def main():
    """Example usage of the YouTubeTranscriber."""
    
    # Example YouTube URL
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Replace with actual URL
    
    # Initialize transcriber
    transcriber = YouTubeTranscriber(model_size="base")
    
    try:
        # Process video
        result = transcriber.process_video(url, language="en")
        
        if result:
            print("\n=== TRANSCRIPTION RESULT ===")
            print(f"Video: {result['title']}")
            print(f"Duration: {result['duration']} seconds")
            print(f"Language: {result['language']}")
            print(f"Captions: {len(result['captions'])} segments")
            
            # Save result
            transcriber.save_result(result)
            
            # Print first few captions
            print("\n=== SAMPLE CAPTIONS ===")
            for caption in result['captions'][:5]:
                print(f"[{caption['startTime']:.1f}s - {caption['endTime']:.1f}s] {caption['text']}")
        
        else:
            print("Failed to process video")
    
    finally:
        # Clean up
        transcriber.cleanup()

if __name__ == "__main__":
    main()
