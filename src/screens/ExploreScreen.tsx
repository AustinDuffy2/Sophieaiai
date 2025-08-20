import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    content: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
    youtubeButton: {
      backgroundColor: '#FF0000',
      borderRadius: 20,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF0000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      minWidth: 200,
    },
    youtubeButtonText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
      marginLeft: 12,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      textAlign: 'center',
      marginTop: 32,
      lineHeight: 24,
      maxWidth: 300,
    },
  });

  const handleYouTubePress = () => {
    console.log('🎯 YouTube button pressed, navigating to YouTube WebView...');
    try {
      (navigation as any).navigate('YouTubeWebView');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.youtubeButton}
          onPress={handleYouTubePress}
        >
          <Ionicons name="logo-youtube" size={32} color="#FFFFFF" />
          <Text style={styles.youtubeButtonText}>
            Open YouTube
          </Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>
          Tap to open YouTube with intelligent caption features and real-time transcription
        </Text>
      </View>
    </View>
  );
};

export default ExploreScreen;
