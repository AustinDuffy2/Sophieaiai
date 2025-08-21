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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LocalStorageService from '../services/localStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [queuedVideos, setQueuedVideos] = useState<QueuedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<QueuedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  });

  // Load queued videos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadQueuedVideos();
    }, [])
  );

  const loadQueuedVideos = async () => {
    try {
      setIsLoading(true);
      const saved = await LocalStorageService.getQueuedVideos();
      console.log('📋 Loaded queued videos:', saved);
      setQueuedVideos(saved);
      
      // Set the first video as current if no video is currently playing
      if (saved.length > 0 && !currentVideo) {
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

  const handlePlayVideo = (video: QueuedVideo) => {
    console.log('🎬 Playing video:', video.title);
    setCurrentVideo(video);
    setIsPlaying(true);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        <Text style={styles.appBarTitle}>Queue</Text>
        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.appBarButtonYouTube}
            onPress={() => (navigation as any).navigate('YouTubeWebView')}
          >
            <Ionicons
              name="logo-youtube"
              size={20}
              color={isDark ? '#FF0000' : '#FF0000'}
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
              const videoId = extractVideoId(currentVideo.url);
              console.log('🎯 Extracted video ID:', videoId);
              
              if (!videoId) {
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
                      Could not extract video ID from URL
                    </Text>
                  </View>
                );
              }

                             return (
                 <View style={styles.webViewContainer}>
                   <WebView
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
                             </style>
                           </head>
                           <body>
                             <div class="video-container">
                               <iframe 
                                 src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1"
                                 title="YouTube video player"
                                 frameborder="0"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 allowfullscreen>
                               </iframe>
                               <script>
                                 console.log('🎬 iframe src:', 'https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1');
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
                     onLoad={() => console.log('✅ WebView loaded for video:', videoId)}
                     onError={(error) => console.log('❌ WebView error:', error)}
                     onHttpError={(error) => console.log('❌ WebView HTTP error:', error)}
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

        {/* Queue List */}
        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <View>
              <Text style={styles.queueTitle}>Queue</Text>
              <Text style={styles.queueCount}>{queuedVideos.length} videos</Text>
            </View>
            {queuedVideos.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearQueue}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {queuedVideos.length > 0 ? (
            <FlatList
              data={queuedVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons
                name="list-outline"
                size={48}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={styles.noVideoIcon}
              />
              <Text style={styles.noVideoTitle}>Queue is Empty</Text>
              <Text style={styles.noVideoSubtitle}>
                Videos you queue from the YouTube screen will appear here
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default QueueScreen;
