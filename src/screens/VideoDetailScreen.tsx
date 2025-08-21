import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SavedTranscription } from '../services/localStorage';
import LocalStorageService from '../services/localStorage';
import AISummaryOverlay from '../components/AISummaryOverlay';
import NotificationBanner from '../components/NotificationBanner';
import ProcessingModal from '../components/ProcessingModal';
import { api } from '../services/api';

const { width, height } = Dimensions.get('window');

interface VideoDetail extends SavedTranscription {
  thumbnail?: string;
  duration?: string;
  channelTitle?: string;
  viewCount?: string;
  publishedAt?: string;
}

const VideoDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  console.log('🎬 VideoDetailScreen mounted with params:', route.params);
  
  const params = route.params as { videoDetail: VideoDetail } | undefined;
  const videoDetail = params?.videoDetail;

  // Handle case where videoDetail is not provided
  if (!videoDetail) {
    console.error('❌ No videoDetail provided in route params');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
            <Text style={styles.title}>Error</Text>
          </View>
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.title, { textAlign: 'center', marginBottom: 8 }]}>
            Video Details Not Found
          </Text>
          <Text style={[styles.metaLabel, { textAlign: 'center' }]}>
            The video information could not be loaded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [selectedCaption, setSelectedCaption] = useState<any | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

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
    headerRight: {
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
    openaiIcon: {
      padding: 10,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 255, 0.2)',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    videoInfoCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    videoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    videoIcon: {
      marginRight: 12,
    },
    videoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      lineHeight: 24,
    },
    videoMeta: {
      marginBottom: 16,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metaLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      width: 80,
    },
    metaValue: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
    },
    videoUrl: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      fontFamily: 'monospace',
    },
    statsCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1DA1F2',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      textAlign: 'center',
    },
    captionsSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 16,
    },
    captionItem: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    captionItemSelected: {
      borderColor: '#1DA1F2',
      backgroundColor: isDark ? 'rgba(29, 161, 242, 0.1)' : 'rgba(29, 161, 242, 0.05)',
    },
    captionText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      lineHeight: 24,
      marginBottom: 8,
    },
    captionTime: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      fontWeight: '500',
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1DA1F2',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      flex: 1,
      justifyContent: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getVideoDuration = (): number => {
    if (videoDetail.captions.length === 0) return 0;
    const lastCaption = videoDetail.captions[videoDetail.captions.length - 1];
    return lastCaption.endTime;
  };

  const getWordCount = (): number => {
    return videoDetail.captions.reduce((total, caption) => {
      return total + caption.text.split(' ').length;
    }, 0);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlayVideo = () => {
    // Navigate to YouTube WebView with this video
    (navigation as any).navigate('YouTubeWebView', {
      initialUrl: videoDetail.video_url,
    });
  };

  const handleDeleteVideo = () => {
    const isQueuedVideo = videoDetail.captions.length === 0;
    const alertTitle = isQueuedVideo ? 'Remove from Queue' : 'Delete Video';
    const alertMessage = isQueuedVideo 
      ? 'Are you sure you want to remove this video from the queue?'
      : 'Are you sure you want to delete this video and its transcriptions? This action cannot be undone.';
    
    Alert.alert(
      alertTitle,
      alertMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isQueuedVideo ? 'Remove' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isQueuedVideo) {
                // Remove from queue
                await LocalStorageService.removeQueuedVideo(videoDetail.id);
                Alert.alert('Success', 'Video removed from queue');
              } else {
                // Delete saved transcription
                await LocalStorageService.deleteSavedTranscription(videoDetail.id);
                Alert.alert('Success', 'Video deleted successfully');
              }
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete video:', error);
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  const handleCaptionPress = (caption: Caption) => {
    setSelectedCaption(selectedCaption?.id === caption.id ? null : caption);
  };

  const handleOpenAIPress = () => {
    setShowAISummary(true);
  };

  const handleTranscribeVideo = async () => {
    if (isTranscribing) return;
    
    console.log('🎤 Transcribe button clicked!');
    console.log('📋 Video detail:', videoDetail);
    
    setIsTranscribing(true);
    setShowProcessingModal(true);
    setProcessingStatus({ status: 'pending', message: 'Initializing transcription...' });
    
    try {
      console.log('🎤 Starting transcription for video:', videoDetail.video_title);
      console.log('🔗 Video URL:', videoDetail.video_url);
      console.log('🔍 Full video detail object:', JSON.stringify(videoDetail, null, 2));
      
      // Test backend connection first
      console.log('🔍 Testing backend connection...');
      const isHealthy = await api.healthCheck();
      console.log('🏥 Backend health check result:', isHealthy);
      
      if (!isHealthy) {
        setProcessingStatus({ 
          status: 'failed', 
          error: 'Backend server is not running. Please run: npm run start-backend' 
        });
        throw new Error('Backend server is not running. Please run: npm run start-backend');
      }
      
      // Start the processing and get task ID
      console.log('🚀 Calling api.processVideo...');
      const taskId = await api.processVideo(videoDetail.video_url);
      console.log('📋 Processing started with task ID:', taskId);
      
      setProcessingStatus({ status: 'processing', message: 'Processing video...' });
      
      // Poll for completion with progress updates
      const finalStatus = await api.pollUntilComplete(taskId, (status) => {
        console.log('📊 Processing status update:', status);
        setProcessingStatus(status);
      });
      
      if (finalStatus.status === 'completed') {
        console.log('✅ Processing completed, getting captions...');
        setProcessingStatus({ status: 'completed', message: 'Getting captions...' });
        
        // Get the captions
        const captions = await api.getCaptions(taskId);
        console.log('📝 Captions retrieved:', captions.length);
        
        // Save the transcription
        await LocalStorageService.saveTranscription(
          videoDetail.video_url,
          videoDetail.video_title,
          captions,
          'en'
        );
        
        console.log('💾 Transcription saved to local storage');
        
        // Show success notification
        setNotification({
          visible: true,
          title: 'Transcription Complete',
          message: `${captions.length} captions generated successfully!`,
          type: 'success'
        });
        
        // Close processing modal after a short delay
        setTimeout(() => {
          setShowProcessingModal(false);
          
          // Navigate back to QueueScreen with the video that now has captions
          setTimeout(() => {
            // If this was a queued video, navigate back to QueueScreen
            if (videoDetail.captions.length === 0) {
              // This was a queued video that now has captions
              console.log('🎬 Navigating back to QueueScreen with transcribed video');
              navigation.goBack();
            } else {
              // This was already a saved transcription, just go back
              navigation.goBack();
            }
          }, 1000);
        }, 2000);
      } else {
        throw new Error(finalStatus.error || 'Processing failed');
      }
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      setProcessingStatus({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      setNotification({
        visible: true,
        title: 'Transcription Failed',
        message: error instanceof Error ? error.message : 'Failed to transcribe the video. Please try again.',
        type: 'error'
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Video Details</Text>
        </View>
        
        <View style={styles.headerRight}>
          {videoDetail.captions.length === 0 && (
            <TouchableOpacity 
              style={[styles.openaiIcon, { marginRight: 8 }]} 
              onPress={handleTranscribeVideo}
              disabled={isTranscribing}
            >
              <Ionicons 
                name={isTranscribing ? "hourglass-outline" : "mic-outline"} 
                size={20} 
                color={isDark ? '#FF6B35' : '#FF6B35'} 
              />
              {isTranscribing && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF6B35',
                }} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[
              styles.openaiIcon, 
              videoDetail.captions.length === 0 && { opacity: 0.5 }
            ]} 
            onPress={videoDetail.captions.length > 0 ? handleOpenAIPress : undefined}
            disabled={videoDetail.captions.length === 0}
          >
            <Ionicons 
              name="analytics-outline" 
              size={20} 
              color={isDark ? '#007AFF' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Info Card */}
        <View style={styles.videoInfoCard}>
          <View style={styles.videoHeader}>
            <Ionicons 
              name="videocam" 
              size={24} 
              color={isDark ? '#1DA1F2' : '#1DA1F2'} 
              style={styles.videoIcon}
            />
            <Text style={styles.videoTitle} numberOfLines={2}>
              {videoDetail.video_title}
            </Text>
          </View>

          <View style={styles.videoMeta}>
            {videoDetail.channelTitle && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Channel:</Text>
                <Text style={styles.metaValue}>{videoDetail.channelTitle}</Text>
              </View>
            )}
            {videoDetail.duration && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Duration:</Text>
                <Text style={styles.metaValue}>{videoDetail.duration}</Text>
              </View>
            )}
            {videoDetail.viewCount && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Views:</Text>
                <Text style={styles.metaValue}>{videoDetail.viewCount}</Text>
              </View>
            )}
            {videoDetail.publishedAt && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Published:</Text>
                <Text style={styles.metaValue}>{formatDate(videoDetail.publishedAt)}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Language:</Text>
              <Text style={styles.metaValue}>{videoDetail.language}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Saved:</Text>
              <Text style={styles.metaValue}>{formatDate(videoDetail.saved_at)}</Text>
            </View>
            <Text style={styles.videoUrl} numberOfLines={1}>
              {videoDetail.video_url}
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Video Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{videoDetail.captions.length}</Text>
              <Text style={styles.statLabel}>Captions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {videoDetail.captions.length > 0 ? formatTime(getVideoDuration()) : (videoDetail.duration || 'N/A')}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {videoDetail.captions.length > 0 ? getWordCount() : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>
        </View>

        {/* Captions Section */}
        <View style={styles.captionsSection}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          {videoDetail.captions.length > 0 ? (
            videoDetail.captions.map((caption, index) => (
              <TouchableOpacity
                key={caption.id || index}
                style={[
                  styles.captionItem,
                  selectedCaption?.id === caption.id && styles.captionItemSelected
                ]}
                onPress={() => handleCaptionPress(caption)}
              >
                <Text style={styles.captionText}>{caption.text}</Text>
                <Text style={styles.captionTime}>
                  {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.captionItem, { alignItems: 'center', paddingVertical: 32 }]}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={{ marginBottom: 16 }}
              />
              <Text style={[styles.captionText, { textAlign: 'center', marginBottom: 8 }]}>
                No transcription available
              </Text>
              <Text style={[styles.captionTime, { textAlign: 'center' }]}>
                This video hasn't been transcribed yet
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePlayVideo}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play Video</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={handleDeleteVideo}
          >
            <Ionicons 
              name={videoDetail.captions.length === 0 ? "close" : "trash-outline"} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {videoDetail.captions.length === 0 ? 'Remove from Queue' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Summary Overlay */}
      <AISummaryOverlay
        visible={showAISummary}
        onClose={() => setShowAISummary(false)}
        captions={videoDetail.captions}
        videoTitle={videoDetail.video_title}
      />

      {/* Notification Banner */}
      <NotificationBanner
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
        autoHide={true}
        duration={5000}
      />
      
      {/* Processing Modal */}
      <ProcessingModal
        visible={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        onComplete={() => setShowProcessingModal(false)}
        selectedLanguage="English"
        processingStatus={processingStatus}
      />
    </SafeAreaView>
  );
};

export default VideoDetailScreen;
