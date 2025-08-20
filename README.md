# Sophieaiai

A React Native YouTube captioning app with local storage and transcription management.

## Features

- **YouTube WebView Integration**: Browse and watch YouTube videos directly in the app
- **Real-time Caption Processing**: Generate captions for any YouTube video using AI
- **Local Storage**: Save transcriptions locally for offline access
- **Transcription Management**: View, organize, and manage saved transcriptions
- **Modern UI**: Clean, Apple-inspired interface with dark/light mode support
- **Processing Status**: Real-time updates on caption generation progress
- **Non-intrusive Notifications**: Apple-style notification banners

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Python Flask API with OpenAI Whisper
- **Storage**: Local AsyncStorage for transcriptions
- **Database**: Supabase for caption processing
- **Navigation**: React Navigation with bottom tabs and stack navigation

## Screens

- **Explore Screen**: Main entry point with YouTube navigation
- **YouTube WebView Screen**: Embedded YouTube player with caption functionality
- **Transcriptions Screen**: List of saved video transcriptions
- **Video Detail Screen**: Detailed view of saved transcriptions with full captions

## Components

- **CaptionOverlay**: Displays captions over YouTube videos
- **ProcessingModal**: Shows real-time processing status
- **NotificationBanner**: Non-intrusive success notifications
- **LanguageSelector**: Language selection for captions

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Python Backend**:
   ```bash
   cd python-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   - Copy `python-backend/env.template` to `python-backend/.env`
   - Add your Supabase credentials

4. **Start the App**:
   ```bash
   # Terminal 1: Start React Native app
   npm start
   
   # Terminal 2: Start Python backend
   cd python-backend
   python api_server.py
   ```

## Usage

1. **Navigate to YouTube**: Use the Explore screen to access YouTube
2. **Find a Video**: Browse and select any YouTube video
3. **Generate Captions**: Click the captions icon to start processing
4. **Save Transcriptions**: Use the save button to store captions locally
5. **View Saved**: Access saved transcriptions from the Transcriptions tab

## Project Structure

```
matric/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── services/           # API and storage services
│   └── types/              # TypeScript type definitions
├── python-backend/         # Python Flask API
├── assets/                 # App assets and icons
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
