# Matric - Intelligent Video Companion

A React Native Expo app with TypeScript that provides intelligent video captioning and enhanced viewing experience. Built with a clean Apple/Twitter design aesthetic.

## Features

- **Three-Tab Navigation**: Home, Explore, and Profile screens
- **YouTube WebView Integration**: Browse YouTube content directly in the app
- **Real-time Caption Overlay**: Apple Music-style caption display with smooth animations
- **Processing Modal**: Simulated video processing with caption extraction
- **Dark/Light Mode Support**: Automatic theme switching based on system preferences
- **Clean UI Design**: Minimalist design following Apple and Twitter design principles

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation (Bottom Tabs)
- React Native WebView
- Expo Vector Icons
- React Native Modal

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd matric
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## App Structure

```
src/
├── components/
│   └── CaptionOverlay.tsx    # Real-time caption display component
├── screens/
│   ├── HomeScreen.tsx        # Welcome and overview screen
│   ├── ExploreScreen.tsx     # YouTube webview and caption features
│   └── ProfileScreen.tsx     # User profile and settings
└── types/
    └── index.ts             # TypeScript type definitions
```

## Usage

### Home Screen
- Welcome screen with app overview
- Clean card-based layout
- Quick access to main features

### Explore Screen
- YouTube button to open webview
- Caption processing functionality
- Real-time caption overlay with progress tracking

### Profile Screen
- User statistics and information
- Settings and preferences
- Clean menu-based navigation

## Features in Detail

### YouTube WebView Integration
- Full YouTube browsing experience
- Custom header with caption controls
- Seamless integration with caption features

### Caption Processing
- Simulated video detection and processing
- Modal-based progress indication
- Mock caption data with realistic timing

### Caption Overlay
- Apple Music-style design
- Smooth fade and slide animations
- Progress bar for current caption
- Real-time synchronization

## Design Principles

- **Minimalist UI**: Clean, uncluttered interface
- **Consistent Spacing**: Proper padding and margins throughout
- **Icon Usage**: Ionicons instead of emojis for professional look
- **Glassmorphism**: Subtle transparency and blur effects
- **Dark/Light Mode**: Automatic theme switching
- **Smooth Animations**: Fluid transitions and interactions

## Development

### Adding New Features
1. Create components in `src/components/`
2. Add screens in `src/screens/`
3. Update types in `src/types/index.ts`
4. Follow the established design patterns

### Styling Guidelines
- Use `useColorScheme()` for theme-aware styling
- Follow the established color palette
- Maintain consistent spacing and typography
- Use shadows and elevation for depth

## Future Enhancements

- Real YouTube API integration
- Actual video caption extraction
- User authentication
- Caption customization options
- Video history tracking
- Offline caption storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
