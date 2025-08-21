import os
import re
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse, parse_qs
import whisper
import yt_dlp
from pydub import AudioSegment
import tempfile
import json
from datetime import datetime
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class YouTubeTranscriber:
    """
    Initialize the YouTube transcriber with Whisper model.
    
    Args:
        model_size (str): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        use_fast_api (bool): Whether to use OpenAI's Whisper API for faster processing
    """
    def __init__(self, model_size: str = "base", use_fast_api: bool = True):
        self.model_size = model_size
        self.use_fast_api = use_fast_api
        self.temp_dir = tempfile.mkdtemp()
        
        # Initialize OpenAI client if using fast API
        if self.use_fast_api:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                self.openai_client = openai.OpenAI(api_key=api_key)
                print(f"🚀 Using OpenAI Whisper API for fast processing")
            else:
                print(f"⚠️ OpenAI API key not found, falling back to local Whisper model")
                self.use_fast_api = False
                self.openai_client = None
        
        # Initialize local Whisper model with optimizations
        if not self.use_fast_api:
            print(f"📦 Loading optimized local Whisper model: {model_size}")
            self.model = whisper.load_model(model_size)
        else:
            # Still load local model for fallback
            print(f"📦 Loading optimized local Whisper model for fallback: {model_size}")
            self.model = whisper.load_model(model_size)
        
        # Set model to evaluation mode for faster inference
        if hasattr(self.model, 'eval'):
            self.model.eval()
    
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
            
            # Configure yt-dlp options for faster download
            ydl_opts = {
                'format': 'worstaudio/worst',  # Use worst audio for faster download
                'outtmpl': audio_path,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                }],
                'quiet': True,
                'nocheckcertificate': True,  # Skip SSL verification for speed
                'no_warnings': True,
                'extractaudio': True,
                'audioformat': 'wav',
                'audioquality': '0',  # Best quality within format
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
        Optimize for OpenAI API size limits (25MB max).
        
        Args:
            audio_path (str): Path to audio file
            
        Returns:
            str: Path to WAV file or None if failed
        """
        try:
            print("Converting audio to WAV format...")
            
            # Load audio with pydub
            audio = AudioSegment.from_file(audio_path)
            
            # Check file size and compress if needed for OpenAI API (25MB limit)
            wav_path = os.path.join(self.temp_dir, "audio.wav")
            
            # Optimize for speed: use lower quality for local processing
            if self.use_fast_api:
                # For fast API, try to compress to fit under 25MB
                sample_rates = [16000, 8000]  # Try 16kHz first, then 8kHz if needed
                bit_depths = [16, 8]  # Try 16-bit first, then 8-bit if needed
                
                for sample_rate in sample_rates:
                    for bit_depth in bit_depths:
                        # Export with current settings
                        audio.export(wav_path, format="wav", 
                                   parameters=["-ar", str(sample_rate), "-ac", "1", "-sample_fmt", f"s{bit_depth}"])
                        
                        # Check file size
                        file_size = os.path.getsize(wav_path)
                        size_mb = file_size / (1024 * 1024)
                        
                        print(f"Audio converted: {size_mb:.2f}MB (sample_rate={sample_rate}Hz, bit_depth={bit_depth}bit)")
                        
                        # If under 24MB (safety margin), we're good
                        if size_mb < 24:
                            print(f"✅ Audio optimized for OpenAI API: {size_mb:.2f}MB")
                            return wav_path
                        else:
                            print(f"⚠️ File too large ({size_mb:.2f}MB), trying lower quality...")
                
                # If we get here, file is still too large - use local processing
                print(f"⚠️ Audio file too large for OpenAI API, will use local processing")
                return wav_path
            else:
                # For local processing, use optimized settings for speed
                print("⚡ Optimizing audio for fast local processing...")
                # Use 8kHz mono for faster processing
                audio.export(wav_path, format="wav", 
                           parameters=["-ar", "8000", "-ac", "1", "-sample_fmt", "s16"])
                
                file_size = os.path.getsize(wav_path)
                size_mb = file_size / (1024 * 1024)
                print(f"✅ Audio optimized for local processing: {size_mb:.2f}MB (8kHz mono)")
                return wav_path
            
        except Exception as e:
            print(f"Error converting audio: {str(e)}")
            return None
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Optional[Dict[str, Any]]:
        """
        Transcribe audio using OpenAI Whisper API (fast) or local model (fallback).
        
        Args:
            audio_path (str): Path to audio file
            language (str): Language code (e.g., 'en', 'es', 'fr')
            
        Returns:
            dict: Transcription result with segments and metadata
        """
        try:
            print(f"Transcribing audio in {language}...")
            
            if self.use_fast_api and self.openai_client:
                print("🚀 Using OpenAI Whisper API for fast transcription...")
                result = self._transcribe_with_openai_api(audio_path, language)
                if result is None:
                    print("🔄 Fast API skipped, using local model...")
                    return self._transcribe_with_local_model(audio_path, language)
                return result
            else:
                print("📦 Using local Whisper model...")
                return self._transcribe_with_local_model(audio_path, language)
            
        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
            return None
    
    def _transcribe_with_openai_api(self, audio_path: str, language: str) -> Optional[Dict[str, Any]]:
        """
        Transcribe audio using OpenAI's Whisper API for fast processing.
        """
        try:
            # Check file size before attempting API call
            file_size = os.path.getsize(audio_path)
            size_mb = file_size / (1024 * 1024)
            
            if size_mb > 24:  # Safety margin under 25MB limit
                print(f"⚠️ Audio file too large for OpenAI API ({size_mb:.2f}MB), skipping fast API")
                return None
            
            with open(audio_path, "rb") as audio_file:
                print(f"📤 Sending audio to OpenAI Whisper API ({size_mb:.2f}MB)...")
                
                # Use OpenAI's Whisper API
                response = self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="verbose_json"
                )
                
                print("✅ OpenAI API transcription completed!")
                
                # Convert OpenAI response to Whisper format
                result = {
                    "text": response.text,
                    "language": response.language,
                    "segments": []
                }
                
                # Process segments if available
                if hasattr(response, 'segments') and response.segments:
                    for segment in response.segments:
                        result["segments"].append({
                            "id": segment.get("id", 0),
                            "seek": segment.get("seek", 0),
                            "start": segment.get("start", 0),
                            "end": segment.get("end", 0),
                            "text": segment.get("text", ""),
                            "tokens": segment.get("tokens", []),
                            "temperature": segment.get("temperature", 0),
                            "avg_logprob": segment.get("avg_logprob", 0),
                            "compression_ratio": segment.get("compression_ratio", 0),
                            "no_speech_prob": segment.get("no_speech_prob", 0)
                        })
                
                return result
                
        except Exception as e:
            print(f"❌ OpenAI API transcription failed: {str(e)}")
            print("🔄 Falling back to local model...")
            return self._transcribe_with_local_model(audio_path, language)
    
    def _transcribe_with_local_model(self, audio_path: str, language: str) -> Optional[Dict[str, Any]]:
        """
        Transcribe audio using local Whisper model (fallback).
        """
        try:
            # Transcribe with optimized local Whisper model
            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=False,  # Reduce verbosity for speed
                word_timestamps=False,  # Disable word timestamps for speed
                fp16=False,  # Use FP32 for better compatibility
                temperature=0.0,  # Deterministic output
                compression_ratio_threshold=2.4,  # More aggressive compression
                logprob_threshold=-1.0,  # More permissive threshold
                no_speech_threshold=0.6,  # More permissive threshold
            )
            
            print("✅ Local Whisper transcription completed!")
            return result
            
        except Exception as e:
            print(f"❌ Local Whisper transcription failed: {str(e)}")
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
        Optimized for maximum speed.
        
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
            
            # Download audio (optimized for speed)
            print("⚡ Downloading audio (optimized for speed)...")
            audio_path = self.download_audio(url)
            if not audio_path:
                return None
            
            # Convert to WAV (optimized for speed)
            print("⚡ Converting audio (optimized for speed)...")
            wav_path = self.convert_to_wav(audio_path)
            if not wav_path:
                return None
            
            # Transcribe (optimized for speed)
            print("⚡ Transcribing audio (optimized for speed)...")
            transcription = self.transcribe_audio(wav_path, language)
            if not transcription:
                return None
            
            # Format captions
            captions = self.format_captions(transcription)
            
            # Get video info using yt-dlp (optimized)
            with yt_dlp.YoutubeDL({'quiet': True, 'no_warnings': True}) as ydl:
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
