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
import AISummaryOverlay from '../components/AISummaryOverlay';

const { width, height } = Dimensions.get('window');

interface VideoDetail extends SavedTranscription {}

const VideoDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { videoDetail } = route.params as {
    videoDetail: VideoDetail;
  };

  const [selectedCaption, setSelectedCaption] = useState<any | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);

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
      padding: 8,
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      borderRadius: 8,
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
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video and its transcriptions? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Supabase
              // await SupabaseService.deleteSavedTranscription(videoDetail.id);
              Alert.alert('Success', 'Video deleted successfully');
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
          <TouchableOpacity style={styles.openaiIcon} onPress={handleOpenAIPress}>
            <Ionicons 
              name="logo-openai" 
              size={20} 
              color={isDark ? '#10A37F' : '#10A37F'} 
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
              <Text style={styles.statValue}>{formatTime(getVideoDuration())}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getWordCount()}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>
        </View>

        {/* Captions Section */}
        <View style={styles.captionsSection}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          {videoDetail.captions.map((caption, index) => (
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
          ))}
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
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
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
    </SafeAreaView>
  );
};

export default VideoDetailScreen;
