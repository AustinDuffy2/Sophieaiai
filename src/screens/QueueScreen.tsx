import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Alert,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LocalStorageService from '../services/localStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import QueuedVideosOverlay from '../components/QueuedVideosOverlay';

interface QueuedVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  addedAt: string;
  videoId?: string;
  channelTitle?: string;
  viewCount?: string;
  publishedAt?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const QueueScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  const [queuedVideos, setQueuedVideos] = useState<QueuedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<QueuedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQueuedVideosOverlay, setShowQueuedVideosOverlay] = useState(false);
  const [currentVideoCaptions, setCurrentVideoCaptions] = useState<any[]>([]);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [isCheckingEmbeddability, setIsCheckingEmbeddability] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F8F9FA',
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1C1C1E' : '#E9ECEF',
    },
          appBarTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: isDark ? '#FFFFFF' : '#000000',
      },
      appBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      backButton: {
        padding: 8,
        marginRight: 12,
      },
    appBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appBarButtonYouTube: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderRadius: 10,
      padding: 10,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 0, 0, 0.2)',
    },
    content: {
      flex: 1,
    },
    playerContainer: {
      width: '100%',
      height: 220,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7',
      overflow: 'hidden',
    },
    webViewContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    noVideoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    noVideoIcon: {
      marginBottom: 20,
      opacity: 0.7,
    },
    noVideoTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
      textAlign: 'center',
    },
    noVideoSubtitle: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      textAlign: 'center',
      lineHeight: 24,
    },
    queueSection: {
      flex: 1,
      padding: 20,
    },
    queueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    queueTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    queueCount: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    clearButton: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    clearButtonText: {
      color: '#FF3B30',
      fontSize: 14,
      fontWeight: '600',
    },
    videoItem: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F2F2F7',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    currentVideoIndicator: {
      borderColor: '#1DA1F2',
      borderWidth: 2,
      backgroundColor: isDark ? 'rgba(29, 161, 242, 0.1)' : 'rgba(29, 161, 242, 0.05)',
    },
    videoThumbnail: {
      width: 80,
      height: 60,
      borderRadius: 8,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    playingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(29, 161, 242, 0.8)',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    currentVideoText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#1DA1F2',
      marginBottom: 4,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 4,
      lineHeight: 22,
    },
    videoMeta: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      marginBottom: 2,
    },
    videoDuration: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    },
    videoActions: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    actionButton: {
      padding: 8,
      marginVertical: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    captionsSection: {
      flex: 1,
      padding: 20,
    },
    captionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    captionsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    captionsCount: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    captionItem: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F2F2F7',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
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
  });

  // Load queued videos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 QueueScreen - Screen focused, loading videos...');
      loadQueuedVideos();
      
      // If we have a current video, refresh its captions
      if (currentVideo) {
        console.log('🔄 Refreshing captions for current video:', currentVideo.title);
        checkCurrentVideoCaptions(currentVideo);
      }
    }, [currentVideo])
  );

  // Check for selected video from navigation params
  React.useEffect(() => {
    const params = route.params as { selectedVideo?: QueuedVideo } | undefined;
    
    if (params?.selectedVideo) {
      console.log('🎬 QueueScreen - Received selected video:', params.selectedVideo.title);
      setCurrentVideo(params.selectedVideo);
      setIsPlaying(true);
      checkCurrentVideoCaptions(params.selectedVideo);
    }
  }, [route.params]);

  // Check for captions when current video changes
  React.useEffect(() => {
    if (currentVideo) {
      checkCurrentVideoCaptions(currentVideo);
    }
  }, [currentVideo]);

  // Check embeddability when current video changes
  React.useEffect(() => {
    if (currentVideo) {
      const checkEmbeddability = async () => {
        const validation = validateVideoUrl(currentVideo.url);
        if (validation.valid) {
          setIsCheckingEmbeddability(true);
          const result = await checkVideoEmbeddability(validation.videoId);
          setIsCheckingEmbeddability(false);
          
          if (!result.embeddable) {
            console.log('❌ Video not embeddable:', result.error);
            setIframeError(result.error);
          } else {
            console.log('✅ Video is embeddable');
            setIframeError(null);
          }
        }
      };
      
      checkEmbeddability();
    }
  }, [currentVideo]);

  const loadQueuedVideos = async () => {
    try {
      setIsLoading(true);
      const saved = await LocalStorageService.getQueuedVideos();
      console.log('📋 QueueScreen - Loaded queued videos:', saved.length, 'videos');
      setQueuedVideos(saved);
      
      // Set the first video as current if no video is currently playing and no selected video
      const params = route.params as { selectedVideo?: QueuedVideo } | undefined;
      if (saved.length > 0 && !currentVideo && !params?.selectedVideo) {
        console.log('🎬 Setting first video as current:', saved[0]);
        setCurrentVideo(saved[0]);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to load queued videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentVideoCaptions = async (video: QueuedVideo) => {
    try {
      const savedTranscriptions = await LocalStorageService.getSavedTranscriptions();
      const transcription = savedTranscriptions.find(t => t.video_url === video.url);
      
      if (transcription && transcription.captions.length > 0) {
        console.log('📝 Found captions for current video:', transcription.captions.length);
        setCurrentVideoCaptions(transcription.captions);
      } else {
        console.log('📝 No captions found for current video');
        setCurrentVideoCaptions([]);
      }
    } catch (error) {
      console.error('Failed to check video captions:', error);
      setCurrentVideoCaptions([]);
    }
  };

  const handlePlayVideo = (video: QueuedVideo) => {
    console.log('🎬 Playing video:', video.title);
    setCurrentVideo(video);
    setIsPlaying(true);
    setIframeError(null); // Clear any previous iframe errors
    checkCurrentVideoCaptions(video);
  };



  const handleRemoveVideo = async (videoId: string) => {
    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove this video from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.removeQueuedVideo(videoId);
              setQueuedVideos(prev => prev.filter(v => v.id !== videoId));
              
              // If we're removing the current video, set the next one
              if (currentVideo?.id === videoId) {
                const remainingVideos = queuedVideos.filter(v => v.id !== videoId);
                if (remainingVideos.length > 0) {
                  setCurrentVideo(remainingVideos[0]);
                } else {
                  setCurrentVideo(null);
                  setIsPlaying(false);
                }
              }
            } catch (error) {
              console.error('Failed to remove video:', error);
            }
          },
        },
      ]
    );
  };

  const handleShowQueuedVideosOverlay = () => {
    setShowQueuedVideosOverlay(true);
  };

  const handleOpenVideoDetails = async () => {
    if (!currentVideo) {
      Alert.alert('No Video', 'Please select a video first');
      return;
    }

    try {
      console.log('📋 Opening video details for:', currentVideo.title);
      
      // Check if there's a saved transcription for this video
      const savedTranscriptions = await LocalStorageService.getSavedTranscriptions();
      const savedTranscription = savedTranscriptions.find(
        t => t.video_url === currentVideo.url
      );
      
      if (savedTranscription) {
        // Navigate to VideoDetailScreen with the saved transcription
        (navigation as any).navigate('VideoDetailScreen', {
          videoDetail: savedTranscription
        });
      } else {
        // Create a basic video detail object from queued video data
        const videoDetail = {
          id: currentVideo.id,
          video_url: currentVideo.url,
          video_title: currentVideo.title,
          captions: [], // Empty captions since it's not transcribed yet
          language: 'en',
          saved_at: currentVideo.addedAt,
          // Add additional queued video info
          thumbnail: currentVideo.thumbnail,
          duration: currentVideo.duration,
          channelTitle: currentVideo.channelTitle,
          viewCount: currentVideo.viewCount,
          publishedAt: currentVideo.publishedAt,
        };
        
        (navigation as any).navigate('VideoDetailScreen', {
          videoDetail: videoDetail
        });
      }
    } catch (error) {
      console.error('Failed to open video detail:', error);
      Alert.alert('Error', 'Failed to open video details');
    }
  };

  const handleClearQueue = async () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear all videos from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.clearQueuedVideos();
              setQueuedVideos([]);
              setCurrentVideo(null);
              setIsPlaying(false);
            } catch (error) {
              console.error('Failed to clear queue:', error);
            }
          },
        },
      ]
    );
  };

  const extractVideoId = (url: string) => {
    console.log('🔍 Extracting video ID from URL:', url);
    
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
        console.log('✅ Found video ID:', match[1], 'using pattern', i + 1);
        return match[1];
      }
    }
    
    console.log('❌ No video ID found in URL:', url);
    return '';
  };

  const validateVideoUrl = (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return { valid: false, error: 'Invalid YouTube URL' };
    }
    
    // Check if video ID is valid format (11 characters, alphanumeric, hyphens, underscores)
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdPattern.test(videoId)) {
      return { valid: false, error: 'Invalid video ID format' };
    }
    
    return { valid: true, videoId };
  };

  const checkVideoEmbeddability = async (videoId: string) => {
    try {
      console.log('🔍 Checking embeddability for video:', videoId);
      
      // Try to fetch the embed page to check if video is available
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const response = await fetch(embedUrl);
      
      if (response.ok) {
        const html = await response.text();
        
        // Check for common error messages in the embed page
        if (html.includes('This video is not available')) {
          return { embeddable: false, error: 'This video is not available' };
        } else if (html.includes('This video is private')) {
          return { embeddable: false, error: 'This video is private' };
        } else if (html.includes('Video unavailable')) {
          return { embeddable: false, error: 'Video unavailable' };
        } else if (html.includes('Embedding disabled')) {
          return { embeddable: false, error: 'Embedding disabled by uploader' };
        } else if (html.includes('This video contains content from')) {
          return { embeddable: false, error: 'Video contains restricted content' };
        }
        
        return { embeddable: true };
      } else {
        return { embeddable: false, error: 'Video not found' };
      }
    } catch (error) {
      console.log('❌ Error checking embeddability:', error);
      return { embeddable: true }; // Assume embeddable if check fails
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderCaptionItem = ({ item }: { item: any }) => (
    <View style={styles.captionItem}>
      <Text style={styles.captionText}>{item.text}</Text>
      <Text style={styles.captionTime}>
        {formatTime(item.startTime)} - {formatTime(item.endTime)}
      </Text>
    </View>
  );

  const renderVideoItem = ({ item }: { item: QueuedVideo }) => {
    const isCurrentVideo = currentVideo?.id === item.id;
    const videoId = extractVideoId(item.url);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

    return (
      <TouchableOpacity
        style={[styles.videoItem, isCurrentVideo && styles.currentVideoIndicator]}
        onPress={() => handlePlayVideo(item)}
        activeOpacity={0.7}
      >
        <View style={styles.videoThumbnail}>
          {videoId ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="play-circle-outline"
              size={32}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          )}
          {isCurrentVideo && (
            <View style={styles.playingOverlay}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.videoInfo}>
          {isCurrentVideo && (
            <Text style={styles.currentVideoText}>NOW PLAYING</Text>
          )}
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoMeta}>
            Added {formatDate(item.addedAt)}
          </Text>
          {item.duration && (
            <Text style={styles.videoDuration}>
              <Ionicons name="time-outline" size={12} color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} />
              {' '}{item.duration}
            </Text>
          )}
        </View>

        <View style={styles.videoActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePlayVideo(item)}
          >
            <Ionicons
              name={isCurrentVideo ? "pause" : "play"}
              size={20}
              color={isCurrentVideo ? '#FF3B30' : (isDark ? '#FFFFFF' : '#000000')}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveVideo(item.id)}
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? '#FF3B30' : '#FF3B30'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.appBar}>
          <Text style={styles.appBarTitle}>Queue</Text>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="refresh"
            size={32}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.noVideoTitle, { marginTop: 16 }]}>Loading Queue...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
              {/* Custom App Bar */}
        <SafeAreaView style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>Queue</Text>
          </View>
          <View style={styles.appBarActions}>
            <TouchableOpacity
              style={[styles.appBarButtonYouTube, { marginRight: 8 }]}
              onPress={() => (navigation as any).navigate('YouTubeWebView')}
            >
              <Ionicons
                name="logo-youtube"
                size={20}
                color={isDark ? '#FF0000' : '#FF0000'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.appBarButtonYouTube, { marginRight: 8, backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: 'rgba(0, 122, 255, 0.2)' }]}
              onPress={handleOpenVideoDetails}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDark ? '#007AFF' : '#007AFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.appBarButtonYouTube, { backgroundColor: 'rgba(29, 161, 242, 0.1)', borderColor: 'rgba(29, 161, 242, 0.2)' }]}
              onPress={handleShowQueuedVideosOverlay}
            >
              <Ionicons
                name="list"
                size={20}
                color={isDark ? '#1DA1F2' : '#1DA1F2'}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

      <View style={styles.content}>
        {/* YouTube Player */}
        <View style={styles.playerContainer}>
          {currentVideo ? (
            (() => {
              console.log('🎯 Current video:', currentVideo);
              console.log('🎯 Video URL:', currentVideo.url);
              const validation = validateVideoUrl(currentVideo.url);
              console.log('🎯 Video validation:', validation);
              
              if (!validation.valid) {
                return (
                  <View style={styles.noVideoContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={64}
                      color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                      style={styles.noVideoIcon}
                    />
                    <Text style={styles.noVideoTitle}>Invalid Video URL</Text>
                    <Text style={styles.noVideoSubtitle}>
                      {validation.error}
                    </Text>
                  </View>
                );
              }
              
              const videoId = validation.videoId;

                                                            return isCheckingEmbeddability ? (
                                 <View style={styles.noVideoContainer}>
                                   <Ionicons
                                     name="refresh"
                                     size={64}
                                     color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                                     style={styles.noVideoIcon}
                                   />
                                   <Text style={styles.noVideoTitle}>Checking Video...</Text>
                                   <Text style={styles.noVideoSubtitle}>
                                     Verifying video availability
                                   </Text>
                                 </View>
                               ) : iframeError ? (
                                 <View style={styles.noVideoContainer}>
                                   <Ionicons
                                     name="alert-circle-outline"
                                     size={64}
                                     color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                                     style={styles.noVideoIcon}
                                   />
                                   <Text style={styles.noVideoTitle}>Video Not Available</Text>
                                   <Text style={styles.noVideoSubtitle}>
                                     {iframeError}
                                   </Text>
                                   <TouchableOpacity
                                     style={{
                                       backgroundColor: '#1DA1F2',
                                       paddingHorizontal: 20,
                                       paddingVertical: 10,
                                       borderRadius: 8,
                                       marginTop: 16,
                                     }}
                                     onPress={() => {
                                       setIframeError(null);
                                       // Force reload by changing the key
                                     }}
                                   >
                                     <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                                       Try Again
                                     </Text>
                                   </TouchableOpacity>
                                 </View>
                               ) : (
                                                                <View style={styles.webViewContainer}>
                                   <WebView
                                     key={`${videoId}-${Date.now()}`}
                     source={{
                       html: `
                         <!DOCTYPE html>
                         <html>
                           <head>
                             <meta charset="utf-8">
                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
                             <title>YouTube Player</title>
                             <style>
                               * {
                                 margin: 0;
                                 padding: 0;
                                 box-sizing: border-box;
                               }
                               html, body {
                                 width: 100%;
                                 height: 100%;
                                 background: #000;
                                 overflow: hidden;
                               }
                               .video-container {
                                 width: 100%;
                                 height: 100%;
                                 display: flex;
                                 align-items: center;
                                 justify-content: center;
                               }
                               iframe {
                                 width: 100%;
                                 height: 100%;
                                 border: 0;
                                 display: block;
                               }
                               .error-container {
                                 width: 100%;
                                 height: 100%;
                                 display: flex;
                                 flex-direction: column;
                                 align-items: center;
                                 justify-content: center;
                                 color: white;
                                 font-family: Arial, sans-serif;
                                 text-align: center;
                                 padding: 20px;
                               }
                               .error-icon {
                                 font-size: 48px;
                                 margin-bottom: 16px;
                               }
                               .error-title {
                                 font-size: 18px;
                                 font-weight: bold;
                                 margin-bottom: 8px;
                               }
                               .error-message {
                                 font-size: 14px;
                                 opacity: 0.8;
                               }
                             </style>
                           </head>
                           <body>
                             <div class="video-container">
                               <iframe 
                                 src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&origin=${encodeURIComponent('https://www.youtube.com')}"
                                 title="YouTube video player"
                                 frameborder="0"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                 allowfullscreen
                                 onload="console.log('✅ iframe loaded successfully')"
                                 onerror="console.log('❌ iframe failed to load'); window.parent.postMessage({type: 'iframe-error', error: 'Failed to load video'}, '*');">
                               </iframe>
                                                                <script>
                                   console.log('🎬 iframe src:', 'https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&origin=${encodeURIComponent('https://www.youtube.com')}');
                                   
                                   // Listen for iframe load errors
                                   window.addEventListener('message', function(event) {
                                     if (event.data && event.data.type === 'iframe-error') {
                                       console.log('❌ iframe error received:', event.data.error);
                                       window.parent.postMessage({type: 'iframe-error', error: event.data.error}, '*');
                                     }
                                   });
                                   
                                   // Check if iframe loaded successfully after a delay
                                   setTimeout(function() {
                                     var iframe = document.querySelector('iframe');
                                     if (iframe && iframe.contentWindow) {
                                       try {
                                         // Try to access iframe content to check if it loaded
                                         var iframeDoc = iframe.contentWindow.document;
                                         console.log('✅ iframe content accessible');
                                         
                                         // Check if the iframe has any content
                                         if (iframeDoc.body && iframeDoc.body.innerHTML) {
                                           console.log('✅ iframe has content');
                                           if (iframeDoc.body.innerHTML.includes('This video is not available')) {
                                             console.log('❌ Video not available message detected');
                                             window.parent.postMessage({type: 'iframe-error', error: 'This video is not available'}, '*');
                                           } else if (iframeDoc.body.innerHTML.includes('This video is private')) {
                                             console.log('❌ Private video detected');
                                             window.parent.postMessage({type: 'iframe-error', error: 'This video is private'}, '*');
                                           } else if (iframeDoc.body.innerHTML.includes('Video unavailable')) {
                                             console.log('❌ Video unavailable detected');
                                             window.parent.postMessage({type: 'iframe-error', error: 'Video unavailable'}, '*');
                                           }
                                         } else {
                                           console.log('❌ iframe has no content');
                                           window.parent.postMessage({type: 'iframe-error', error: 'Video not available for embedding'}, '*');
                                         }
                                       } catch (e) {
                                         console.log('❌ iframe content not accessible - likely blocked:', e.message);
                                         window.parent.postMessage({type: 'iframe-error', error: 'Video not available for embedding'}, '*');
                                       }
                                     } else {
                                       console.log('❌ iframe not found or no contentWindow');
                                       window.parent.postMessage({type: 'iframe-error', error: 'Failed to load video player'}, '*');
                                     }
                                   }, 3000);
                                   
                                   // Additional check for iframe load events
                                   var iframe = document.querySelector('iframe');
                                   if (iframe) {
                                     iframe.addEventListener('load', function() {
                                       console.log('✅ iframe load event fired');
                                     });
                                     
                                     iframe.addEventListener('error', function() {
                                       console.log('❌ iframe error event fired');
                                       window.parent.postMessage({type: 'iframe-error', error: 'Failed to load video'}, '*');
                                     });
                                   }
                                 </script>
                             </div>
                           </body>
                         </html>
                       `
                     }}
                     style={{ flex: 1 }}
                     allowsFullscreenVideo={true}
                     mediaPlaybackRequiresUserAction={false}
                     allowsInlineMediaPlayback={true}
                     javaScriptEnabled={true}
                     domStorageEnabled={true}
                     onLoad={() => {
                       console.log('✅ WebView loaded for video:', videoId);
                       setIframeError(null);
                     }}
                     onError={(error) => {
                       console.log('❌ WebView error:', error);
                       setIframeError('Failed to load video player');
                     }}
                     onHttpError={(error) => {
                       console.log('❌ WebView HTTP error:', error);
                       setIframeError('Video not available');
                     }}
                     onMessage={(event) => {
                       console.log('📨 WebView message:', event.nativeEvent.data);
                       if (event.nativeEvent.data && event.nativeEvent.data.type === 'iframe-error') {
                         setIframeError(event.nativeEvent.data.error);
                       }
                     }}
                   />
                 </View>
               );
            })()
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons
                name="play-circle-outline"
                size={64}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={styles.noVideoIcon}
              />
              <Text style={styles.noVideoTitle}>No Video Playing</Text>
              <Text style={styles.noVideoSubtitle}>
                Select a video from the queue below to start watching
              </Text>
            </View>
          )}
        </View>

        {/* Captions Section */}
        <View style={styles.captionsSection}>
          <View style={styles.captionsHeader}>
            <View>
              <Text style={styles.captionsTitle}>Captions</Text>
              {currentVideoCaptions.length > 0 && (
                <Text style={styles.captionsCount}>{currentVideoCaptions.length} captions</Text>
              )}
            </View>
          </View>

          {currentVideo && currentVideoCaptions.length > 0 ? (
            <FlatList
              data={currentVideoCaptions}
              renderItem={renderCaptionItem}
              keyExtractor={(item, index) => `caption-${index}`}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => {
                    loadQueuedVideos();
                    if (currentVideo) {
                      checkCurrentVideoCaptions(currentVideo);
                    }
                  }}
                  tintColor={isDark ? '#FFFFFF' : '#000000'}
                />
              }
            />
          ) : currentVideo ? (
            <View style={styles.noVideoContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={styles.noVideoIcon}
              />
              <Text style={styles.noVideoTitle}>No Captions Generated Yet</Text>
              <Text style={styles.noVideoSubtitle}>
                Double-tap the video to open details and transcribe it
              </Text>
            </View>
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons
                name="play-circle-outline"
                size={48}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={styles.noVideoIcon}
              />
              <Text style={styles.noVideoTitle}>No Video Playing</Text>
              <Text style={styles.noVideoSubtitle}>
                Select a video from the queue overlay to start watching
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Queued Videos Overlay */}
      <QueuedVideosOverlay
        visible={showQueuedVideosOverlay}
        onClose={() => setShowQueuedVideosOverlay(false)}
        queuedVideos={queuedVideos}
        onVideoPress={handlePlayVideo}
        onRemoveVideo={handleRemoveVideo}
        onRefresh={loadQueuedVideos}
        refreshing={isLoading}
      />
    </View>
  );
};

export default QueueScreen;
