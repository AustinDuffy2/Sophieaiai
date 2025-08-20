import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NotificationBannerProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onAction?: () => void;
  onDismiss?: () => void;
  actionText?: string;
  autoHide?: boolean;
  duration?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  title,
  message,
  type = 'success',
  onAction,
  onDismiss,
  actionText = 'View',
  autoHide = true,
  duration = 5000,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDark ? '#1C3A1C' : '#E8F5E8',
          borderColor: '#34C759',
          iconColor: '#34C759',
          icon: 'checkmark-circle' as const,
        };
      case 'info':
        return {
          backgroundColor: isDark ? '#1C2A3A' : '#E8F2F8',
          borderColor: '#1DA1F2',
          iconColor: '#1DA1F2',
          icon: 'information-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: isDark ? '#3A2A1C' : '#FEF8E8',
          borderColor: '#FF9500',
          iconColor: '#FF9500',
          icon: 'warning' as const,
        };
      case 'error':
        return {
          backgroundColor: isDark ? '#3A1C1C' : '#FEE8E8',
          borderColor: '#FF3B30',
          iconColor: '#FF3B30',
          icon: 'close-circle' as const,
        };
      default:
        return {
          backgroundColor: isDark ? '#1C2A3A' : '#E8F2F8',
          borderColor: '#1DA1F2',
          iconColor: '#1DA1F2',
          icon: 'information-circle' as const,
        };
    }
  };

  const typeStyles = getTypeStyles();

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const handleAction = () => {
    onAction?.();
    hideNotification();
  };

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingTop: 50, // Safe area
      paddingHorizontal: 16,
    },
    banner: {
      backgroundColor: typeStyles.backgroundColor,
      borderWidth: 1,
      borderColor: typeStyles.borderColor,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      marginRight: 12,
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      lineHeight: 20,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    actionButton: {
      backgroundColor: typeStyles.iconColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    dismissButton: {
      padding: 4,
    },
    dismissText: {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: 14,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.banner}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={typeStyles.icon}
              size={24}
              color={typeStyles.iconColor}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.actions}>
              {onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
                  <Text style={styles.actionText}>{actionText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.dismissButton} onPress={hideNotification}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default NotificationBanner;
