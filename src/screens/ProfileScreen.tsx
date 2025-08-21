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
import { Alert } from 'react-native';
import LocalStorageService from '../services/localStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClearCache = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your saved transcriptions and queued videos. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all transcriptions
              await LocalStorageService.clearAllTranscriptions();
              // Clear all queued videos
              await LocalStorageService.clearQueuedVideos();
              
              Alert.alert(
                'Success',
                'All data has been cleared successfully!',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Failed to clear cache:', error);
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    profileName: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 32,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    statLabel: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1C1C1E' : '#F2F2F7',
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    menuText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '500',
    },
    menuSubtext: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 2,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity>
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons 
              name="person" 
              size={40} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Videos Watched</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Captions Generated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8.5h</Text>
            <Text style={styles.statLabel}>Watch Time</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="notifications-outline" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </View>
            <View>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuSubtext}>Manage your notification preferences</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="language-outline" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </View>
            <View>
              <Text style={styles.menuText}>Language</Text>
              <Text style={styles.menuSubtext}>English (US)</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="moon-outline" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </View>
            <View>
              <Text style={styles.menuText}>Appearance</Text>
              <Text style={styles.menuSubtext}>Dark mode</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="trash-outline" 
                size={20} 
                color="#FF3B30" 
              />
            </View>
            <View>
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>Clear All Data</Text>
              <Text style={styles.menuSubtext}>Delete all transcriptions and queued videos</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="help-circle-outline" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </View>
            <View>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuSubtext}>Get help and contact support</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons 
                name="information-circle-outline" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </View>
            <View>
              <Text style={styles.menuText}>About</Text>
              <Text style={styles.menuSubtext}>Version 1.0.0</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
