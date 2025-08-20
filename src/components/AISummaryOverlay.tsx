import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface AISummaryOverlayProps {
  visible: boolean;
  onClose: () => void;
  captions: any[];
  videoTitle: string;
}

const AISummaryOverlay: React.FC<AISummaryOverlayProps> = ({
  visible,
  onClose,
  captions,
  videoTitle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateAISummary = async () => {
    if (captions.length === 0) {
      setError('No captions available to summarize');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combine all captions into a single text
      const fullText = captions.map(caption => caption.text).join(' ');
      
      // For now, we'll use a simple summary since we don't have OpenAI API set up
      // In a real implementation, you would call OpenAI API here
      const mockSummary = await generateMockSummary(fullText, videoTitle);
      setSummary(mockSummary);
    } catch (err) {
      console.error('Error generating AI summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockSummary = async (text: string, title: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock summary based on the content
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    return `📝 **AI Summary of "${title}"**

🎯 **Key Points:**
${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

📊 **Content Overview:**
This video contains approximately ${sentences.length} main points covering various topics. The content appears to be informative and engaging, with clear structure and flow.

🤖 **AI Analysis:**
Based on the transcript analysis, this content is well-organized and provides valuable insights. The language used is accessible and the pacing allows for good comprehension.

💡 **Key Takeaways:**
• Engaging presentation style
• Clear information delivery
• Well-structured content flow
• Accessible language usage`;
  };

  useEffect(() => {
    if (visible && !summary && !loading) {
      generateAISummary();
    }
  }, [visible]);

  const handleClose = () => {
    setSummary('');
    setError('');
    onClose();
  };

  const handleRegenerate = () => {
    setSummary('');
    generateAISummary();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Ionicons 
                name="logo-openai" 
                size={20} 
                color="#10A37F" 
                style={styles.openaiIcon}
              />
              <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                AI Summary
              </Text>
            </View>
          </View>
          
          {summary && !loading && (
            <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color="#10A37F" 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10A37F" />
              <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Generating AI Summary...
              </Text>
              <Text style={[styles.loadingSubtext, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                Analyzing {captions.length} caption segments
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons 
                name="alert-circle" 
                size={48} 
                color="#FF3B30" 
                style={styles.errorIcon}
              />
              <Text style={[styles.errorTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Summary Failed
              </Text>
              <Text style={[styles.errorText, { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }]}>
                {error}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRegenerate}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {summary && !loading && !error && (
            <View style={styles.summaryContainer}>
              <Text style={[styles.summaryText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {summary}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openaiIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  regenerateButton: {
    padding: 8,
    backgroundColor: 'rgba(16, 163, 127, 0.1)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#10A37F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingVertical: 20,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
});

export default AISummaryOverlay;
