import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import LocalStorageService from '../services/localStorage';
import { QueuedVideo } from '../types';

const ViewAllQueuedScreen: React.FC = () => {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [queuedVideos, setQueuedVideos] = useState<QueuedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueuedVideos = async () => {
    try {
      console.log('🔄 Loading all queued videos...');
      const videos = await LocalStorageService.getQueuedVideos();
      console.log('📋 Loaded queued videos:', videos.length);
      setQueuedVideos(videos);
    } catch (error) {
      console.error('❌ Failed to load queued videos:', error);
      Alert.alert('Error', 'Failed to load queued videos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQueuedVideos();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadQueuedVideos();
  };

  const handleVideoPress = (video: QueuedVideo) => {
    console.log('🎬 Navigating to QueueScreen with selected video:', video.title);
    (navigation as any).navigate('QueueScreen', {
      selectedVideo: video
    });
  };

  const handleRemoveVideo = async (videoId: string) => {
    try {
      await LocalStorageService.removeQueuedVideo(videoId);
      console.log('🗑️ Removed video from queue:', videoId);
      loadQueuedVideos(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to remove video:', error);
      Alert.alert('Error', 'Failed to remove video from queue');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    
    // Parse ISO 8601 duration format (PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const extractVideoId = (url: string) => {
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
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const renderVideoItem = ({ item }: { item: QueuedVideo }) => {
    const videoId = extractVideoId(item.url);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

    return (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => handleVideoPress(item)}
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
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoMeta}>
            Added {formatDate(item.addedAt)}
          </Text>
          {item.duration && (
            <Text style={styles.videoMeta}>
              Duration: {item.duration}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveVideo(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={isDark ? '#FF453A' : '#FF3B30'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1C1C1E' : '#E9ECEF',
    },
    appBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    appBarTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      marginTop: 20,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#666666',
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
    videoThumbnail: {
      width: 80,
      height: 60,
      borderRadius: 8,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    videoInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
      lineHeight: 22,
    },
    videoMeta: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    removeButton: {
      padding: 8,
      alignSelf: 'flex-start',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyStateText: {
      fontSize: 18,
      color: isDark ? '#8E8E93' : '#666666',
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#666666',
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
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
            <Text style={styles.appBarTitle}>All Queued Videos</Text>
          </View>
        </SafeAreaView>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.emptyStateText}>Loading...</Text>
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
          <Text style={styles.appBarTitle}>All Queued Videos</Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {queuedVideos.length} Queued Video{queuedVideos.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.headerSubtitle}>
            Tap any video to play it in the queue
          </Text>
        </View>

        {queuedVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="play-circle-outline"
              size={64}
              color={isDark ? '#8E8E93' : '#666666'}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyStateText}>No videos in queue</Text>
            <Text style={styles.emptyStateSubtext}>
              Add videos from YouTube to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={queuedVideos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? '#FFFFFF' : '#000000'}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default ViewAllQueuedScreen;
