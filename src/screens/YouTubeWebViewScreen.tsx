import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import CaptionOverlay from '../components/CaptionOverlay';
import ProcessingModal from '../components/ProcessingModal';
import NotificationBanner from '../components/NotificationBanner';
import { SupabaseService, Caption } from '../services/supabase';
import LocalStorageService, { QueuedVideo } from '../services/localStorage';

const { width, height } = Dimensions.get('window');

const YouTubeWebViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [realCaptions, setRealCaptions] = useState<Caption[]>([]);
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  const [currentYouTubeUrl, setCurrentYouTubeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [isTranscriptionSaved, setIsTranscriptionSaved] = useState(false);
  const [isVideoQueued, setIsVideoQueued] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1C1C1E' : '#F2F2F7',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    captionButton: {
      backgroundColor: '#1DA1F2',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#1DA1F2',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    captionButtonDisabled: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      opacity: 0.6,
    },
    captionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    captionButtonTextDisabled: {
      color: isDark ? '#8E8E93' : '#8E8E93',
    },
    queueButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#FF3B30',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    queueButtonActive: {
      backgroundColor: '#34C759',
    },
    queueButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    closeButton: {
      padding: 8,
    },
    webviewContainer: {
      flex: 1,
      position: 'relative',
    },
    webview: {
      flex: 1,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      marginTop: 12,
    },
    urlIndicator: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      zIndex: 999,
    },
    urlText: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCaptionPress = async () => {
    console.log('🎯 Caption button pressed!');
    console.log('📱 Current YouTube URL:', currentYouTubeUrl);
    
    // Check if we have a valid YouTube URL
    if (!currentYouTubeUrl || !currentYouTubeUrl.includes('youtube.com/watch')) {
      console.log('❌ No valid YouTube video URL detected');
      Alert.alert(
        'No YouTube Video',
        'Please navigate to a YouTube video first, then try the captions feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('✅ Valid YouTube video detected, starting processing...');
    setShowProcessingModal(true);
    
    try {
      const videoUrl = currentYouTubeUrl;
      console.log('🎬 Processing video URL:', videoUrl);
      
      // Check for existing captions
      console.log('🔍 Checking for existing captions...');
      const existingTaskId = await SupabaseService.checkExistingCaptions(videoUrl);
      
              if (existingTaskId) {
          console.log('✅ Found existing captions, fetching them...');
          const captions = await SupabaseService.getCaptions(existingTaskId);
          if (captions && captions.length > 0) {
            setRealCaptions(captions);
            console.log('✅ Existing captions loaded successfully');
            setShowProcessingModal(false);
            showCaptionsReadyNotification();
            return;
          }
        }
      
      // Start new processing
      console.log('🚀 Starting new caption processing...');
      const taskId = await SupabaseService.sendUrlForProcessing(videoUrl, 'en');
      console.log('✅ Task created with ID:', taskId);
      setCurrentTaskId(taskId);
      
      // Poll for completion
      pollTaskCompletion(taskId);
    } catch (error) {
      console.error('❌ Failed to start processing:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to start video processing. Please try again.',
        [{ text: 'OK' }]
      );
      setShowProcessingModal(false);
    }
  };

  const pollTaskCompletion = async (taskId: string) => {
    console.log('📊 Polling task completion for:', taskId);
    
    const pollInterval = setInterval(async () => {
      try {
        const task = await SupabaseService.pollTaskCompletion(taskId);
        console.log('📊 Task status:', task.status);
        
        // Update processing status for the modal
        setProcessingStatus(task);
        
        if (task.status === 'completed') {
          console.log('✅ Task completed:', task);
          clearInterval(pollInterval);
          
          // Get captions from Supabase
          console.log('📝 Fetching captions from Supabase...');
          const captions = await SupabaseService.getCaptions(taskId);
          console.log('📝 Captions received:', captions.length, 'captions');
          
          if (captions && captions.length > 0) {
            setRealCaptions(captions);
            console.log('✅ Real captions set successfully');
            // Close processing modal and show notification
            setShowProcessingModal(false);
            showCaptionsReadyNotification();
          } else {
            console.log('⚠️ No captions received');
            setRealCaptions([]);
            setShowProcessingModal(false);
            Alert.alert(
              'No Captions',
              'No captions were generated for this video.',
              [{ text: 'OK' }]
            );
          }
        } else if (task.status === 'failed') {
          console.error('❌ Task failed:', task);
          clearInterval(pollInterval);
          setShowProcessingModal(false);
          Alert.alert(
            'Processing Failed',
            'Video processing failed. Please try again.',
            [{ text: 'OK' }]
          );
        }
        // If still processing, continue polling
      } catch (error) {
        console.error('❌ Polling error:', error);
        clearInterval(pollInterval);
        setShowProcessingModal(false);
        Alert.alert(
          'Processing Error',
          'An error occurred while processing the video.',
          [{ text: 'OK' }]
        );
      }
    }, 2000); // Poll every 2 seconds
    
    // Cleanup interval after 10 minutes (timeout)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (showProcessingModal) {
        setShowProcessingModal(false);
        Alert.alert(
          'Processing Timeout',
          'Video processing is taking longer than expected. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 600000); // 10 minutes timeout
  };

  const showCaptionsReadyNotification = () => {
    setShowNotification(true);
  };

  const handleShowCaptions = () => {
    setShowCaptions(true);
    // Check if this transcription is already saved
    checkIfSaved();
  };

  // Check queue status when URL changes
  useEffect(() => {
    if (currentYouTubeUrl) {
      checkIfQueued();
    }
  }, [currentYouTubeUrl]);

  const handleDismissNotification = () => {
    setShowNotification(false);
  };

  const handleSaveTranscription = async () => {
    try {
      if (!currentYouTubeUrl || realCaptions.length === 0) {
        Alert.alert('Error', 'No captions available to save');
        return;
      }

      const videoTitle = getVideoTitle(currentYouTubeUrl);
      await LocalStorageService.saveTranscription(
        currentYouTubeUrl,
        videoTitle,
        realCaptions,
        'en'
      );
      
      setIsTranscriptionSaved(true);
      Alert.alert('Success', 'Transcription saved to Transcriptions screen!');
    } catch (error) {
      console.error('Failed to save transcription:', error);
      Alert.alert('Error', 'Failed to save transcription');
    }
  };

  const getVideoTitle = (url: string) => {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `YouTube Video ${videoId}` : 'YouTube Video';
    } catch {
      return 'YouTube Video';
    }
  };

  const checkIfSaved = async () => {
    if (currentYouTubeUrl) {
      const saved = await LocalStorageService.isTranscriptionSaved(currentYouTubeUrl);
      setIsTranscriptionSaved(saved);
    }
  };

  const checkIfQueued = async () => {
    if (currentYouTubeUrl) {
      const queued = await LocalStorageService.isVideoQueued(currentYouTubeUrl);
      setIsVideoQueued(queued);
    }
  };

  const handleAddToQueue = async () => {
    if (!currentYouTubeUrl || !isVideoPage) {
      Alert.alert('Error', 'Please navigate to a YouTube video first');
      return;
    }

    try {
      console.log('🎬 Adding video to queue:', currentYouTubeUrl);
      const videoTitle = getVideoTitle(currentYouTubeUrl);
      const videoId = extractVideoId(currentYouTubeUrl);
      
      console.log('📝 Video title:', videoTitle);
      console.log('🎯 Video ID:', videoId);
      
      const queueItem = {
        title: videoTitle,
        url: currentYouTubeUrl,
        videoId: videoId,
        channelTitle: 'YouTube Channel', // You can enhance this with real channel info
        viewCount: 'Unknown', // You can enhance this with real view count
        publishedAt: new Date().toISOString(), // You can enhance this with real publish date
      };
      
      console.log('💾 Saving queue item:', queueItem);
      await LocalStorageService.addToQueue(queueItem);
      
      setIsVideoQueued(true);
      Alert.alert('Success', 'Video added to queue!', [
        { text: 'Stay Here', style: 'cancel' },
        { 
          text: 'Go to Queue', 
          onPress: () => {
            // Navigate back to main tabs and then to Queue tab
            (navigation as any).navigate('MainTabs', { screen: 'Queue' });
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Failed to add video to queue:', error);
      Alert.alert('Error', 'Failed to add video to queue');
    }
  };

  const extractVideoId = (url: string) => {
    console.log('🔍 Extracting video ID from URL:', url);
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('✅ Extracted video ID:', match[1], 'using pattern', i + 1);
        return match[1];
      }
    }
    
    console.error('❌ No video ID found in URL:', url);
    console.error('🔍 URL patterns tried:', patterns.length);
    return '';
  };



  const handleCloseCaptions = () => {
    console.log('❌ Closing captions overlay');
    setShowCaptions(false);
  };

  const isVideoPage = currentYouTubeUrl.includes('youtube.com/watch');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          <Text style={styles.title}>YouTube</Text>
        </View>
        
        <View style={styles.headerRight}>
          {isVideoPage && (
            <TouchableOpacity 
              style={[
                styles.queueButton,
                isVideoQueued && styles.queueButtonActive
              ]}
              onPress={handleAddToQueue}
            >
              <Ionicons 
                name={isVideoQueued ? "checkmark" : "add"} 
                size={18} 
                color={isVideoQueued ? '#FFFFFF' : '#FFFFFF'} 
              />
              <Text style={styles.queueButtonText}>
                {isVideoQueued ? 'Queued' : 'Queue'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.captionButton,
              !isVideoPage && styles.captionButtonDisabled
            ]}
            onPress={handleCaptionPress}
            disabled={!isVideoPage}
          >
            <Ionicons 
              name="text-outline" 
              size={18} 
              color={isVideoPage ? '#FFFFFF' : (isDark ? '#8E8E93' : '#8E8E93')} 
            />
            <Text style={[
              styles.captionButtonText,
              !isVideoPage && styles.captionButtonTextDisabled
            ]}>
              {isVideoPage ? 'Captions' : 'Navigate to Video'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons 
              name="close" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.webviewContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Ionicons 
              name="logo-youtube" 
              size={48} 
              color={isDark ? '#FF0000' : '#FF0000'} 
            />
            <Text style={styles.loadingText}>Loading YouTube...</Text>
          </View>
        )}
        
        {isVideoPage && (
          <View style={styles.urlIndicator}>
            <Text style={styles.urlText}>
              🎬 Video detected - Captions available
            </Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://www.youtube.com' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(navState) => {
            const url = navState.url || '';
            setCurrentYouTubeUrl(url);
            console.log('🌐 WebView URL changed:', url);
            console.log('🎬 Is YouTube video:', url.includes('youtube.com/watch'));
          }}
        />
      </View>
      
      {showCaptions && (
        <CaptionOverlay 
          captions={realCaptions} 
          onClose={handleCloseCaptions}
          videoUrl={currentYouTubeUrl}
          videoTitle={getVideoTitle(currentYouTubeUrl)}
          onSave={handleSaveTranscription}
          isSaved={isTranscriptionSaved}
        />
      )}

      <ProcessingModal
        visible={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        onComplete={() => {
          // This won't be called since we handle completion in polling
          console.log('ProcessingModal onComplete called');
        }}
        onMinimize={() => setShowProcessingModal(false)}
        onStop={() => {
          setShowProcessingModal(false);
          Alert.alert('Processing Stopped', 'Video processing has been stopped.');
        }}
        selectedLanguage="English"
        processingStatus={processingStatus}
      />

      <NotificationBanner
        visible={showNotification}
        title="Captions Ready! 🎉"
        message="Your video captions have been generated successfully."
        type="success"
        onAction={handleShowCaptions}
        onDismiss={handleDismissNotification}
        actionText="Show Captions"
        autoHide={true}
        duration={8000}
      />
    </SafeAreaView>
  );
};

export default YouTubeWebViewScreen;
