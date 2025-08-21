import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TranscriptionsScreen from './src/screens/TranscriptionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import YouTubeWebViewScreen from './src/screens/YouTubeWebViewScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';
import QueueScreen from './src/screens/QueueScreen';
import ViewAllQueuedScreen from './src/screens/ViewAllQueuedScreen';
import MainQueueScreen from './src/screens/MainQueueScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Stack Navigator (contains both tabs and modal screens)
function MainStack() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
      />
      <Stack.Screen 
        name="YouTubeWebView" 
        component={YouTubeWebViewScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="VideoDetailScreen" 
        component={VideoDetailScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="QueueScreen" 
        component={QueueScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ViewAllQueuedScreen" 
        component={ViewAllQueuedScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ 
          headerShown: false 
        }}
      />

    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Queue') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Transcriptions') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1DA1F2',
        tabBarInactiveTintColor: isDark ? '#8899A6' : '#657786',
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderTopColor: isDark ? '#1C1C1E' : '#F2F2F7',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        headerStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderBottomColor: isDark ? '#1C1C1E' : '#F2F2F7',
          borderBottomWidth: 1,
        },
        headerTintColor: isDark ? '#FFFFFF' : '#14171A',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Queue" 
        component={MainQueueScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Transcriptions" 
        component={TranscriptionsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <MainStack />
    </NavigationContainer>
  );
}
