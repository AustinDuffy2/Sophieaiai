import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ProcessingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  onMinimize?: () => void;
  onStop?: () => void;
  selectedLanguage: string;
  processingStatus?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    error?: string;
  } | null;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  visible,
  onClose,
  onComplete,
  onMinimize,
  onStop,
  selectedLanguage,
  processingStatus,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  const processingSteps: ProcessingStep[] = [
    {
      id: 1,
      title: 'Sending to Backend',
      description: 'Sending video URL to processing server',
      icon: 'cloud-upload-outline',
    },
    {
      id: 2,
      title: 'Downloading Video',
      description: 'Backend downloading and extracting audio',
      icon: 'download-outline',
    },
    {
      id: 3,
      title: 'Transcribing Audio',
      description: `Converting audio to text in ${selectedLanguage}`,
      icon: 'mic-outline',
    },
    {
      id: 4,
      title: 'Saving to Database',
      description: 'Storing captions in Supabase',
      icon: 'save-outline',
    },
    {
      id: 5,
      title: 'Ready to Display',
      description: 'Captions available for viewing',
      icon: 'checkmark-circle-outline',
    },
  ];

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      margin: 20,
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    minimizeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    stopButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FF3B30',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    content: {
      padding: 20,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    stepsContainer: {
      marginBottom: 24,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    stepIconPending: {
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    stepIconActive: {
      backgroundColor: '#1DA1F2',
    },
    stepIconCompleted: {
      backgroundColor: '#34C759',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 2,
    },
    stepDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      lineHeight: 18,
    },
    stepTitlePending: {
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    stepTitleActive: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    stepTitleCompleted: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    progressBar: {
      height: 4,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
      borderRadius: 2,
      marginBottom: 20,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#1DA1F2',
      borderRadius: 2,
    },
    progressText: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      textAlign: 'center',
      marginBottom: 20,
    },
    completeButton: {
      backgroundColor: '#34C759',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    completeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  useEffect(() => {
    if (!visible) return;

    // Update processing state based on backend status
    if (processingStatus) {
      if (processingStatus.status === 'completed') {
        setIsProcessing(false);
        setCurrentStep(processingSteps.length - 1);
      } else if (processingStatus.status === 'failed') {
        setIsProcessing(false);
      } else {
        setIsProcessing(true);
        // Estimate current step based on status
        if (processingStatus.status === 'pending') {
          setCurrentStep(0);
        } else if (processingStatus.status === 'processing') {
          setCurrentStep(2); // Assume we're in transcription phase
        }
      }
    }
  }, [visible, processingStatus]);

  const progress = processingStatus?.progress || ((currentStep + 1) / processingSteps.length) * 100;

  const getStepStatus = (stepIndex: number) => {
    if (!processingStatus) {
      // Fallback to internal step progression
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'active';
      return 'pending';
    }

    // Use backend status to determine step status
    if (processingStatus.status === 'completed') {
      return 'completed';
    } else if (processingStatus.status === 'failed') {
      return stepIndex < currentStep ? 'completed' : 'pending';
    } else if (processingStatus.status === 'processing') {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'active';
      return 'pending';
    } else {
      // pending status
      if (stepIndex === 0) return 'active';
      return 'pending';
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {processingStatus?.status === 'completed' 
                ? 'Processing Complete'
                : processingStatus?.status === 'failed'
                ? 'Processing Failed'
                : processingStatus?.status === 'processing'
                ? 'Processing Video'
                : processingStatus?.status === 'pending'
                ? 'Initializing'
                : isProcessing 
                ? 'Processing Video' 
                : 'Processing Complete'
              }
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {processingStatus?.status === 'processing' && onMinimize && (
                <TouchableOpacity 
                  style={styles.minimizeButton} 
                  onPress={onMinimize}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                </TouchableOpacity>
              )}
              {processingStatus?.status === 'processing' && onStop && (
                <TouchableOpacity 
                  style={styles.stopButton} 
                  onPress={onStop}
                >
                  <Ionicons 
                    name="stop" 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
              >
                <Ionicons 
                  name="close" 
                  size={20} 
                  color={isDark ? '#FFFFFF' : '#000000'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {processingStatus?.status === 'completed' 
                ? 'Video processing completed successfully! Your captions are ready.'
                : processingStatus?.status === 'failed'
                ? processingStatus.error || 'Video processing failed. Please try again.'
                : processingStatus?.status === 'processing'
                ? 'Please wait while we process your video and generate captions...'
                : processingStatus?.status === 'pending'
                ? 'Initializing video processing...'
                : isProcessing 
                ? 'Please wait while we process your video and generate captions...'
                : 'Video processing completed successfully! Your captions are ready.'
              }
            </Text>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            
            <Text style={styles.progressText}>
              {processingStatus?.status === 'completed' 
                ? 'All steps completed'
                : processingStatus?.status === 'failed'
                ? 'Processing failed'
                : processingStatus?.status === 'processing'
                ? 'Processing video...'
                : processingStatus?.status === 'pending'
                ? 'Initializing...'
                : isProcessing 
                ? `Step ${currentStep + 1} of ${processingSteps.length}`
                : 'All steps completed'
              }
            </Text>
            
            <View style={styles.stepsContainer}>
              {processingSteps.map((step, index) => {
                const status = getStepStatus(index);
                const isActive = status === 'active';
                const isCompleted = status === 'completed';
                
                return (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={[
                      styles.stepIcon,
                      status === 'pending' && styles.stepIconPending,
                      status === 'active' && styles.stepIconActive,
                      status === 'completed' && styles.stepIconCompleted,
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      ) : (
                        <Ionicons 
                          name={step.icon} 
                          size={20} 
                          color={isActive ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} 
                        />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[
                        styles.stepTitle,
                        status === 'pending' && styles.stepTitlePending,
                        status === 'active' && styles.stepTitleActive,
                        status === 'completed' && styles.stepTitleCompleted,
                      ]}>
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            
            {!isProcessing && (
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <Text style={styles.completeButtonText}>View Captions</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProcessingModal;
