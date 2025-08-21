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
  isGenerating?: boolean;
  currentTime?: number;
  onSeekToTime?: (time: number) => void;
  onRegenerateCaptions?: () => void;
}

type OverlayHeight = 'collapsed' | 'medium' | 'expanded';

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ 
  captions, 
  onClose, 
  videoDuration = 0,
  videoUrl,
  videoTitle,
  isGenerating = false,
  currentTime = 0,
  onSeekToTime,
  onRegenerateCaptions
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [overlayHeight, setOverlayHeight] = useState<OverlayHeight>('medium');
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const captionRefs = useRef<{ [key: number]: View | null }>({});

  const getHeightForState = (state: OverlayHeight): number => {
    switch (state) {
      case 'collapsed':
        return height * 0.25; // 25% of screen height
      case 'medium':
        return height * 0.5; // 50% of screen height
      case 'expanded':
        return height * 0.75; // 75% of screen height
      default:
        return height * 0.5;
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    container: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      paddingHorizontal: 20,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: -8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 15,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      height: getHeightForState(overlayHeight),
    },
    dragHandle: {
      width: 48,
      height: 5,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 2,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    title: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      letterSpacing: -0.5,
    },
    savedIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
    },
    savedText: {
      fontSize: 12,
      color: '#34C759',
      fontWeight: '600',
      marginLeft: 4,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    regenerateButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FF9500',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    progressContainer: {
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    progressBar: {
      height: 2,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: 1,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#1DA1F2',
      borderRadius: 1,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    progressText: {
      fontSize: 10,
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      fontWeight: '500',
    },
    captionCount: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: '500',
    },
    autoScrollToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    autoScrollText: {
      fontSize: 11,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      fontWeight: '500',
      marginLeft: 4,
    },
    heightToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
    },
    heightToggleText: {
      fontSize: 11,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      fontWeight: '500',
      marginLeft: 4,
    },
    captionsList: {
      flex: 1,
    },
    captionItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    },
    captionItemActive: {
      backgroundColor: isDark ? 'rgba(29, 161, 242, 0.15)' : 'rgba(29, 161, 242, 0.08)',
      borderColor: isDark ? 'rgba(29, 161, 242, 0.3)' : 'rgba(29, 161, 242, 0.2)',
      borderLeftWidth: 4,
      borderLeftColor: '#1DA1F2',
    },
    captionItemText: {
      fontSize: 13,
      color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)',
      lineHeight: 18,
      fontWeight: '400',
    },
    captionItemTextActive: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '500',
    },
    captionTime: {
      fontSize: 10,
      color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      marginTop: 2,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30,
    },
    emptyStateText: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  // Slide up animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(true);
    });
  }, []);

  // Update current caption index based on video time
  useEffect(() => {
    if (captions.length === 0 || currentTime === undefined) return;
    
    // Find the caption that should be active at the current time
    let newIndex = -1;
    
    // First, try to find an exact match (current time falls within caption duration)
    newIndex = captions.findIndex(caption => 
      currentTime >= caption.startTime && currentTime <= caption.endTime
    );
    
    // If no exact match, find the closest caption that hasn't ended yet
    if (newIndex === -1) {
      newIndex = captions.findIndex((caption, index) => {
        const nextCaption = captions[index + 1];
        return currentTime >= caption.startTime && 
               (!nextCaption || currentTime < nextCaption.startTime);
      });
    }
    
    // If still no match, find the closest caption by time
    if (newIndex === -1) {
      let closestDistance = Infinity;
      captions.forEach((caption, index) => {
        const distance = Math.abs(currentTime - caption.startTime);
        if (distance < closestDistance) {
          closestDistance = distance;
          newIndex = index;
        }
      });
    }
    
    if (newIndex !== -1 && newIndex !== currentCaptionIndex) {
      setCurrentCaptionIndex(newIndex);
    }
  }, [currentTime, captions]);

  // Auto-scroll to current caption
  useEffect(() => {
    if (!autoScrollEnabled || userScrolling || !scrollViewRef.current || currentCaptionIndex < 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (scrollViewRef.current && currentCaptionIndex >= 0) {
        // Use estimated position to avoid ref measurement issues
        const estimatedItemHeight = 60; // Approximate height per caption item
        const estimatedY = currentCaptionIndex * estimatedItemHeight;
        const scrollOffset = Math.max(0, estimatedY - 60); // Keep some items visible above
        
        scrollViewRef.current.scrollTo({
          y: scrollOffset,
          animated: true,
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentCaptionIndex, autoScrollEnabled, userScrolling]);

  // Reset user scrolling flag after a delay
  useEffect(() => {
    if (userScrolling) {
      const timeoutId = setTimeout(() => {
        setUserScrolling(false);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [userScrolling]);

  const handleScroll = () => {
    if (autoScrollEnabled) {
      setUserScrolling(true);
    }
  };

  const toggleAutoScroll = () => {
    setAutoScrollEnabled(!autoScrollEnabled);
    setUserScrolling(false);
  };

  const toggleHeight = () => {
    const heightOrder: OverlayHeight[] = ['collapsed', 'medium', 'expanded'];
    const currentIndex = heightOrder.indexOf(overlayHeight);
    const nextIndex = (currentIndex + 1) % heightOrder.length;
    setOverlayHeight(heightOrder[nextIndex]);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCaptionPress = (caption: Caption) => {
    if (onSeekToTime) {
      console.log(`🎯 Seeking to caption time: ${caption.startTime}s`);
      onSeekToTime(caption.startTime);
    }
  };

  const getHeightIcon = () => {
    switch (overlayHeight) {
      case 'collapsed':
        return 'expand';
      case 'medium':
        return 'expand';
      case 'expanded':
        return 'contract';
      default:
        return 'expand';
    }
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
        <View style={[styles.container, { height: getHeightForState(overlayHeight) }]}>
          <View style={styles.dragHandle} />
          <View style={styles.header}>
            <Text style={styles.title}>Captions</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons 
                name="close" 
                size={18} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            {isGenerating ? (
              <>
                <Ionicons 
                  name="hourglass-outline" 
                  size={40} 
                  color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'} 
                />
                <Text style={[styles.emptyStateText, { marginTop: 12, fontSize: 16, fontWeight: '600' }]}>
                  Generating Captions
                </Text>
                <Text style={[styles.emptyStateText, { marginTop: 4, fontSize: 12 }]}>
                  Please wait...
                </Text>
              </>
            ) : (
              <Text style={styles.emptyStateText}>No captions available</Text>
            )}
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
        <View style={styles.dragHandle} />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Live Captions</Text>
            <View style={styles.savedIndicator}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color="#34C759" 
              />
              <Text style={styles.savedText}>Auto-saved</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {onRegenerateCaptions && (
              <TouchableOpacity 
                style={[styles.regenerateButton, isGenerating && { opacity: 0.5 }]} 
                onPress={onRegenerateCaptions}
                disabled={isGenerating}
              >
                <Ionicons 
                  name={isGenerating ? "hourglass-outline" : "refresh"} 
                  size={18} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons 
                name="close" 
                size={18} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.captionCount}>
            {captions.length} captions
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.autoScrollToggle} onPress={toggleAutoScroll}>
              <Ionicons 
                name={autoScrollEnabled ? "radio-button-on" : "radio-button-off"} 
                size={12} 
                color={isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'} 
              />
              <Text style={styles.autoScrollText}>
                Auto-track
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heightToggle} onPress={toggleHeight}>
              <Ionicons 
                name={getHeightIcon()} 
                size={12} 
                color={isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'} 
              />
              <Text style={styles.heightToggleText}>
                {overlayHeight === 'collapsed' ? 'Expand' : overlayHeight === 'medium' ? 'More' : 'Less'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {videoDuration > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((currentTime / videoDuration) * 100, 100)}%` }
                ]} 
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{formatTime(currentTime)}</Text>
              <Text style={styles.progressText}>{formatTime(videoDuration)}</Text>
            </View>
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          style={styles.captionsList}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={handleScroll}
          scrollEventThrottle={16}
        >
          {captions.map((caption, index) => {
            const isActive = index === currentCaptionIndex;
            
            return (
              <TouchableOpacity
                key={`${caption.startTime}-${caption.endTime}-${index}`}
                ref={(ref) => {
                  captionRefs.current[index] = ref;
                }}
                style={[
                  styles.captionItem,
                  isActive && styles.captionItemActive,
                ]}
                onPress={() => handleCaptionPress(caption)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default CaptionOverlay;
