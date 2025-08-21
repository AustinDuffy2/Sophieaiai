import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueuedVideo } from '../services/localStorage';

const { width, height } = Dimensions.get('window');

interface QueuedVideosOverlayProps {
  visible: boolean;
  onClose: () => void;
  queuedVideos: QueuedVideo[];
  onVideoPress: (video: QueuedVideo) => void;
  onRemoveVideo: (videoId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const QueuedVideosOverlay: React.FC<QueuedVideosOverlayProps> = ({
  visible,
  onClose,
  queuedVideos,
  onVideoPress,
  onRemoveVideo,
  onRefresh,
  refreshing = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    closeButton: {
      padding: 8,
    },
    videoItem: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#2C2C2E' : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#3C3C3E' : '#E9ECEF',
    },
    videoInfo: {
      flex: 1,
      marginRight: 12,
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
    actionButton: {
      padding: 8,
      marginVertical: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      textAlign: 'center',
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderVideoItem = ({ item }: { item: QueuedVideo }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => onVideoPress(item)}
      activeOpacity={0.7}
    >
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
        style={styles.actionButton}
        onPress={() => onRemoveVideo(item.id)}
      >
        <Ionicons
          name="close"
          size={20}
          color={isDark ? '#FF3B30' : '#FF3B30'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Queued Videos ({queuedVideos.length})</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          {queuedVideos.length > 0 ? (
            <FlatList
              data={queuedVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                onRefresh ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={isDark ? '#FFFFFF' : '#000000'}
                  />
                ) : undefined
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="list-outline"
                size={48}
                color={isDark ? '#FFFFFF' : '#000000'}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No videos in queue</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default QueuedVideosOverlay;
