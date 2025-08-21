import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LocalStorageService, { SavedTranscription } from '../services/localStorage';
import VideoDetailScreen from './VideoDetailScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');



const TranscriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [savedTranscriptions, setSavedTranscriptions] = useState<SavedTranscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    content: {
      flex: 1,
      padding: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 24,
      opacity: 0.7,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    transcriptionCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F8F9FA',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    videoIcon: {
      marginRight: 16,
      backgroundColor: 'rgba(29, 161, 242, 0.1)',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(29, 161, 242, 0.2)',
    },
    videoInfo: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
      lineHeight: 24,
      letterSpacing: -0.3,
    },
    videoMeta: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      marginBottom: 4,
    },
    videoStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    statIcon: {
      marginRight: 4,
      opacity: 0.7,
    },
    statText: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      fontWeight: '500',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1DA1F2',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginRight: 12,
      shadowColor: '#1DA1F2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      marginLeft: 8,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    deleteButtonText: {
      color: '#FF3B30',
      fontSize: 15,
      fontWeight: '700',
      marginLeft: 8,
    },
    captionPreview: {
      backgroundColor: isDark ? '#2C2C2E' : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderLeftWidth: 3,
      borderLeftColor: '#1DA1F2',
    },
    captionPreviewText: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      lineHeight: 20,
      fontStyle: 'italic',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      marginTop: 16,
    },
  });

  useEffect(() => {
    loadSavedTranscriptions();
  }, []);

  const loadSavedTranscriptions = async () => {
    try {
      setLoading(true);
      // Load saved transcriptions from local storage
      const saved = await LocalStorageService.getSavedTranscriptions();
      setSavedTranscriptions(saved);
    } catch (error) {
      console.error('Failed to load saved transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedTranscriptions();
    setRefreshing(false);
  };

  const handleViewCaptions = (transcription: SavedTranscription) => {
    // Navigate to video detail screen with the saved transcription
    (navigation as any).navigate('VideoDetailScreen', {
      videoDetail: transcription,
    });
  };

  const handleDeleteTranscription = async (transcriptionId: string) => {
    Alert.alert(
      'Delete Transcription',
      'Are you sure you want to delete this transcription? This action cannot be undone.',
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
              await LocalStorageService.deleteSavedTranscription(transcriptionId);
              setSavedTranscriptions(prev => 
                prev.filter(t => t.id !== transcriptionId)
              );
            } catch (error) {
              console.error('Failed to delete transcription:', error);
              Alert.alert('Error', 'Failed to delete transcription');
            }
          },
        },
      ]
    );
  };

  const getVideoTitle = (url: string) => {
    // Extract video title from URL or use a default
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `Video ${videoId}` : 'YouTube Video';
    } catch {
      return 'YouTube Video';
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

  const renderTranscriptionCard = ({ item }: { item: SavedTranscription }) => {
    const totalDuration = item.captions.length > 0 ? item.captions[item.captions.length - 1].endTime : 0;
    const wordCount = item.captions.reduce((total, caption) => total + caption.text.split(' ').length, 0);
    
    return (
      <TouchableOpacity 
        style={styles.transcriptionCard}
        onPress={() => handleViewCaptions(item)}
      >
        <View style={styles.cardHeader}>
          <Ionicons 
            name="videocam" 
            size={24} 
            color="#1DA1F2" 
            style={styles.videoIcon}
          />
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.video_title}
            </Text>
            <Text style={styles.videoMeta}>
              {formatDate(item.saved_at)} • {item.language}
            </Text>
            <View style={styles.videoStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={12} color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} style={styles.statIcon} />
                <Text style={styles.statText}>{formatTime(totalDuration)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="text-outline" size={12} color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} style={styles.statIcon} />
                <Text style={styles.statText}>{item.captions.length} segments</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={12} color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} style={styles.statIcon} />
                <Text style={styles.statText}>{wordCount} words</Text>
              </View>
            </View>
          </View>
        </View>

        {item.captions.length > 0 && (
          <View style={styles.captionPreview}>
            <Text style={styles.captionPreviewText} numberOfLines={3}>
              "{item.captions[0].text}..."
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewCaptions(item)}
          >
            <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteTranscription(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Custom App Bar */}
        <SafeAreaView style={styles.appBar}>
          <Text style={styles.appBarTitle}>Transcriptions</Text>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <Ionicons 
            name="logo-youtube" 
            size={48} 
            color={isDark ? '#1DA1F2' : '#1DA1F2'} 
          />
          <Text style={styles.loadingText}>Loading your transcriptions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom App Bar */}
      <SafeAreaView style={styles.appBar}>
        <Text style={styles.appBarTitle}>Transcriptions</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {savedTranscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="document-text-outline" 
              size={64} 
              color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Saved Transcriptions</Text>
            <Text style={styles.emptySubtitle}>
              Your saved video transcriptions will appear here. Generate captions for any YouTube video and save them for later viewing.
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedTranscriptions}
            renderItem={renderTranscriptionCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

export default TranscriptionsScreen;
