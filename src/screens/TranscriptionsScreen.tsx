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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      textAlign: 'center',
      lineHeight: 24,
    },
    transcriptionCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
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
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    videoIcon: {
      marginRight: 12,
    },
    videoInfo: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    videoMeta: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1DA1F2',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#FF3B30' : '#FF3B30',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    captionPreview: {
      backgroundColor: isDark ? '#2C2C2E' : '#F8F9FA',
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
    },
    captionPreviewText: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      lineHeight: 20,
      fontStyle: 'italic',
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

  const renderTranscriptionCard = ({ item }: { item: SavedTranscription }) => (
    <TouchableOpacity 
      style={styles.transcriptionCard}
      onPress={() => handleViewCaptions(item)}
    >
      <View style={styles.cardHeader}>
        <Ionicons 
          name="videocam" 
          size={24} 
          color={isDark ? '#1DA1F2' : '#1DA1F2'} 
          style={styles.videoIcon}
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.video_title}</Text>
          <Text style={styles.videoMeta}>
            {formatDate(item.saved_at)} • {item.language}
          </Text>
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
          <Ionicons name="text-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View Captions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTranscription(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transcriptions</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transcriptions</Text>
      </View>

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
