import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LocalStorageService from '../services/localStorage';

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [queuedVideos, setQueuedVideos] = useState(0);
  const [savedTranscriptions, setSavedTranscriptions] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadStats();
    animateIn();
  }, []);

  const loadStats = async () => {
    try {
      const videos = await LocalStorageService.getQueuedVideos();
      const transcriptions = await LocalStorageService.getSavedTranscriptions();
      setQueuedVideos(videos.length);
      setSavedTranscriptions(transcriptions.length);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F8F9FA',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.4,
    },
    content: {
      flex: 1,
    },
    header: {
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    appBarTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -1,
    },
    appBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appBarButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    welcomeSection: {
      marginBottom: 20,
    },
    welcomeTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: 8,
      letterSpacing: -1,
    },
    welcomeSubtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 26,
      fontWeight: '500',
    },
    mainContent: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F8F9FA',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 30,
      paddingHorizontal: 20,
    },
    statsSection: {
      marginBottom: 30,
    },
    statsTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '900',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      fontWeight: '600',
      textAlign: 'center',
    },
    featuresSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    featureCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      marginBottom: 16,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    featureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    featureIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    featureDescription: {
      fontSize: 15,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      lineHeight: 22,
      fontWeight: '500',
    },
    featureArrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionsSection: {
      marginBottom: 30,
    },
    actionButton: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDark ? 0.15 : 0.06,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    actionText: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 4,
    },
    actionSubtitle: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: '500',
    },
    actionArrow: {
      marginLeft: 12,
    },
    bottomPadding: {
      height: 100,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark ? ['#1DA1F2', '#0D47A1'] : ['#1DA1F2', '#1976D2']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header Section */}
      <SafeAreaView style={styles.header}>
        <Animated.View 
          style={[
            styles.appBar,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.appBarTitle}>Sophieaiai</Text>
          <View style={styles.appBarActions}>
            <TouchableOpacity style={styles.appBarButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.appBarButton}
              onPress={() => (navigation as any).navigate('ProfileScreen')}
            >
              <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your AI-powered YouTube companion. Generate captions, transcribe videos, and enhance your viewing experience.
          </Text>
        </Animated.View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Stats Section */}
          <Animated.View 
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.statsTitle}>Your Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{queuedVideos}</Text>
                <Text style={styles.statLabel}>Videos{'\n'}Queued</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedTranscriptions}</Text>
                <Text style={styles.statLabel}>Transcriptions{'\n'}Saved</Text>
              </View>
            </View>
          </Animated.View>

          {/* Features Section */}
          <Animated.View 
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Features</Text>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => (navigation as any).navigate('YouTubeWebView')}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 0, 0, 0.15)' }]}>
                  <Ionicons name="logo-youtube" size={28} color="#FF0000" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>YouTube Integration</Text>
                  <Text style={styles.featureDescription}>
                    Browse and queue YouTube videos for caption generation
                  </Text>
                </View>
                <View style={styles.featureArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => (navigation as any).navigate('Queue')}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                  <Ionicons name="text-outline" size={28} color="#007AFF" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>AI Captions</Text>
                  <Text style={styles.featureDescription}>
                    Generate accurate captions using advanced AI technology
                  </Text>
                </View>
                <View style={styles.featureArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => (navigation as any).navigate('Transcriptions')}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                  <Ionicons name="document-text-outline" size={28} color="#34C759" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Save & Access</Text>
                  <Text style={styles.featureDescription}>
                    Save transcriptions and access them anytime, anywhere
                  </Text>
                </View>
                <View style={styles.featureArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View 
            style={[
              styles.quickActionsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('YouTubeWebView')}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 0, 0, 0.15)' }]}>
                  <Ionicons name="add" size={24} color="#FF0000" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Add New Video</Text>
                  <Text style={styles.actionSubtitle}>
                    Browse YouTube and add videos to your queue
                  </Text>
                </View>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('Queue')}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                  <Ionicons name="play-circle" size={24} color="#007AFF" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>View Queue</Text>
                  <Text style={styles.actionSubtitle}>
                    Manage your video queue and watch with captions
                  </Text>
                </View>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('Transcriptions')}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                  <Ionicons name="folder-open" size={24} color="#FF9500" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>My Transcriptions</Text>
                  <Text style={styles.actionSubtitle}>
                    Access your saved video transcriptions
                  </Text>
                </View>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;
