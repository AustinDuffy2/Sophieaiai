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

const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    card: {
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 8,
    },
    cardSubtitle: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      lineHeight: 20,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Home</Text>
          <TouchableOpacity>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="play-circle-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </View>
          <Text style={styles.cardTitle}>Welcome to Matric</Text>
          <Text style={styles.cardSubtitle}>
            Your intelligent video companion. Explore videos with real-time captions and enhanced viewing experience.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="search-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </View>
          <Text style={styles.cardTitle}>Discover Content</Text>
          <Text style={styles.cardSubtitle}>
            Head to the Explore tab to browse videos and enable intelligent caption features.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="person-outline" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </View>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <Text style={styles.cardSubtitle}>
            Manage your preferences and view your viewing history in the Profile tab.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
