import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalStorageService, { QueuedVideo } from '../services/localStorage';

const { width: screenWidth } = Dimensions.get('window');

const MainQueueScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const [queuedVideos, setQueuedVideos] = useState<QueuedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F8F9FA',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1C1C1E' : '#E9ECEF',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    queueButton: {
      backgroundColor: 'rgba(29, 161, 242, 0.1)',
      borderRadius: 10,
      padding: 10,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: 'rgba(29, 161, 242, 0.2)',
    },
    content: {
      flex: 1,
      padding: 20,
    },

    recentVideosSection: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    addButton: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: isDark ? '#3C3C3E' : '#E9ECEF',
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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 20,
      opacity: 0.7,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  // Load queued videos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 MainQueueScreen - Screen focused, loading videos...');
      loadQueuedVideos();
    }, [])
  );

  // Also refresh when screen becomes active (when returning from other screens)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 MainQueueScreen - Navigation focus event, refreshing...');
      loadQueuedVideos();
    });

    return unsubscribe;
  }, [navigation]);

  // Refresh when app becomes active (when returning from background)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('🔄 MainQueueScreen - App became active, refreshing...');
        loadQueuedVideos();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Periodic refresh to catch any missed updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 MainQueueScreen - Periodic refresh check...');
      loadQueuedVideos();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadQueuedVideos = async () => {
    try {
      setIsLoading(true);
      // Add a small delay to ensure data is properly saved
      await new Promise(resolve => setTimeout(resolve, 100));
      const saved = await LocalStorageService.getQueuedVideos();
      console.log('📋 MainQueueScreen - Loaded queued videos:', saved.length, 'videos');
      setQueuedVideos(saved);
    } catch (error) {
      console.error('Failed to load queued videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenQueue = () => {
    (navigation as any).navigate('QueueScreen');
  };

  const handleVideoPress = (video: QueuedVideo) => {
    console.log('🎬 MainQueueScreen - Video pressed:', video.title);
    (navigation as any).navigate('QueueScreen', { selectedVideo: video });
  };

  const handleOpenYouTube = () => {
    (navigation as any).navigate('YouTubeWebView');
  };



  const handleRefresh = () => {
    console.log('🔄 MainQueueScreen - Manual refresh triggered');
    loadQueuedVideos();
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
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Queue</Text>
        </SafeAreaView>
        <View style={styles.emptyState}>
          <Ionicons
            name="refresh"
            size={32}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.emptyTitle, { marginTop: 16 }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Queue</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.queueButton, { marginRight: 8 }]}
            onPress={handleRefresh}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={isDark ? '#1DA1F2' : '#1DA1F2'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.queueButton}
            onPress={handleOpenQueue}
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
        {/* Recent Videos Section */}
        <View style={styles.recentVideosSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Videos ({queuedVideos.length})
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleOpenYouTube}
            >
              <Ionicons name="add" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          {queuedVideos.length > 0 ? (
            <>
              <FlatList
                data={queuedVideos.slice(0, 5)} // Show only first 5 videos
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={loadQueuedVideos}
                    tintColor={isDark ? '#FFFFFF' : '#000000'}
                  />
                }
              />
              {queuedVideos.length > 5 && (
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    padding: 16,
                    borderRadius: 12,
                    marginTop: 12,
                    alignItems: 'center',
                  }}
                  onPress={() => (navigation as any).navigate('ViewAllQueuedScreen')}
                >
                  <Text style={{
                    color: isDark ? '#1DA1F2' : '#1DA1F2',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    View All {queuedVideos.length} Videos
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="list-outline"
                size={64}
                color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Videos in Queue</Text>
              <Text style={styles.emptySubtitle}>
                Start by adding videos from YouTube. Tap "Add Videos" to get started.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MainQueueScreen;
