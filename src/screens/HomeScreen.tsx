import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F8F9FA',
    },
    content: {
      padding: 20,
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
    appBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appBarButton: {
      padding: 8,
      marginLeft: 12,
    },
    welcomeSection: {
      marginBottom: 32,
    },
    welcomeTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    welcomeSubtitle: {
      fontSize: 18,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      lineHeight: 26,
      marginBottom: 24,
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    featureCard: {
      width: '48%',
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    featureIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      lineHeight: 20,
    },
    quickActionsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 16,
    },
    actionCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDark ? 0.15 : 0.06,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    actionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      flex: 1,
    },
    actionSubtitle: {
      fontSize: 14,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      lineHeight: 20,
    },
    statsSection: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
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
    statsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Custom App Bar */}
      <SafeAreaView style={styles.appBar}>
        <Text style={styles.appBarTitle}>Home</Text>
        <View style={styles.appBarActions}>
          <TouchableOpacity style={styles.appBarButton}>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.appBarButton}
            onPress={() => (navigation as any).navigate('ProfileScreen')}
          >
            <Ionicons 
              name="person-circle-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Sophieaiai</Text>
          <Text style={styles.welcomeSubtitle}>
            Your AI-powered YouTube companion. Generate captions, transcribe videos, and enhance your viewing experience with intelligent features.
          </Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
              <Ionicons name="logo-youtube" size={28} color="#FF0000" />
            </View>
            <Text style={styles.featureTitle}>YouTube Videos</Text>
            <Text style={styles.featureDescription}>
              Browse and queue YouTube videos for caption generation
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
              <Ionicons name="text-outline" size={28} color="#007AFF" />
            </View>
            <Text style={styles.featureTitle}>AI Captions</Text>
            <Text style={styles.featureDescription}>
              Generate accurate captions using advanced AI technology
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
              <Ionicons name="eye-outline" size={28} color="#34C759" />
            </View>
            <Text style={styles.featureTitle}>Live Viewing</Text>
            <Text style={styles.featureDescription}>
              Watch videos with real-time caption overlays
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={28} color="#FF9500" />
            </View>
            <Text style={styles.featureTitle}>Save & Share</Text>
            <Text style={styles.featureDescription}>
              Save transcriptions and access them anytime
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => (navigation as any).navigate('Queue')}
          >
            <View style={styles.actionHeader}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              </View>
              <Text style={styles.actionTitle}>Browse Videos</Text>
            </View>
            <Text style={styles.actionSubtitle}>
              Add YouTube videos to your queue and start generating captions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => (navigation as any).navigate('Transcriptions')}
          >
            <View style={styles.actionHeader}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                <Ionicons name="document-text-outline" size={20} color="#FF9500" />
              </View>
              <Text style={styles.actionTitle}>View Transcriptions</Text>
            </View>
            <Text style={styles.actionSubtitle}>
              Access your saved video transcriptions and captions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Videos Queued</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Captions Generated</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Transcriptions Saved</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
