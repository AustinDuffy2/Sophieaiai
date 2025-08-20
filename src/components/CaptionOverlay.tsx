import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Caption {
  id?: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

interface CaptionOverlayProps {
  captions: Caption[];
  onClose?: () => void;
  videoDuration?: number;
  videoUrl?: string;
  videoTitle?: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ 
  captions, 
  onClose, 
  videoDuration = 0,
  videoUrl,
  videoTitle,
  onSave,
  isSaved = false
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentTime, setCurrentTime] = useState(0);
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    container: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 24,
      paddingBottom: 50,
      paddingHorizontal: 20,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: -8,
      },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 15,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isSaved ? '#34C759' : '#1DA1F2',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 12,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      letterSpacing: -0.5,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainCaptionContainer: {
      minHeight: 100,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      marginBottom: 24,
    },
    mainCaptionText: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
      lineHeight: 32,
      maxWidth: width - 80,
      letterSpacing: -0.3,
    },
    progressContainer: {
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    progressBar: {
      height: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#1DA1F2',
      borderRadius: 2,
    },
    timeIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    timeText: {
      fontSize: 13,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      fontWeight: '600',
    },
    captionsList: {
      maxHeight: 200,
    },
    captionItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    captionItemActive: {
      backgroundColor: isDark ? 'rgba(29, 161, 242, 0.15)' : 'rgba(29, 161, 242, 0.08)',
      borderColor: isDark ? 'rgba(29, 161, 242, 0.3)' : 'rgba(29, 161, 242, 0.2)',
    },
    captionItemText: {
      fontSize: 15,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      lineHeight: 22,
      fontWeight: '500',
    },
    captionItemTextActive: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
    },
    captionTime: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      marginTop: 4,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      textAlign: 'center',
      fontWeight: '500',
    },
    captionHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    captionHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
  });

  // Slide up animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(true);
    });
  }, []);

  // Display captions without interfering with video playback
  useEffect(() => {
    if (!isVisible || captions.length === 0) return;
    
    // Just show the first caption initially
    setCurrentCaptionIndex(0);
  }, [captions, isVisible]);

  const currentCaption = captions[currentCaptionIndex];
  const progress = videoDuration > 0 ? Math.min(currentTime / videoDuration, 1) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (captions.length === 0) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Captions</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons 
                name="close" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No captions available</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Live Captions</Text>
          </View>
          <View style={styles.headerRight}>
            {onSave && (
              <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                <Ionicons 
                  name={isSaved ? "checkmark" : "bookmark-outline"} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons 
                name="close" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.captionHeader}>
          <Text style={styles.captionHeaderText}>
            Video Captions ({captions.length} captions)
          </Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.captionsList}
          showsVerticalScrollIndicator={false}
        >
          {captions.map((caption, index) => {
            const isActive = index === currentCaptionIndex;
            
            return (
              <View
                key={`${caption.startTime}-${caption.endTime}-${index}`}
                style={[
                  styles.captionItem,
                  isActive && styles.captionItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.captionItemText,
                    isActive && styles.captionItemTextActive,
                  ]}
                >
                  {caption.text}
                </Text>
                <Text style={styles.captionTime}>
                  {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default CaptionOverlay;
