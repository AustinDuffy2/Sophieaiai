import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import TranscriptionsScreen from './src/screens/TranscriptionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import YouTubeWebViewScreen from './src/screens/YouTubeWebViewScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';


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
            } else if (route.name === 'Explore') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Transcriptions') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
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
        options={{ title: 'Home' }}
      />
              <Tab.Screen 
          name="Explore" 
          component={ExploreScreen}
          options={{ title: 'Explore' }}
        />
        <Tab.Screen 
          name="Transcriptions" 
          component={TranscriptionsScreen}
          options={{ title: 'Transcriptions' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
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
