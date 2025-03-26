import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const CountdownTimer = ({ 
  timeRemaining, 
  duration, 
  size = 200, 
  strokeWidth = 15, 
  backgroundColor = '#2C2C2C', 
  progressColor = '#FF9500',
  isActive = false // Prop to check if timer is active
}) => {
  // Animation value for the circular progress
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  // Sound reference
  const soundRef = useRef(null);
  const [soundLoaded, setSoundLoaded] = useState(false);
  
  // Calculate the progress percentage (0 to 1)
  const progress = timeRemaining / (duration * 60);
  
  // Calculate dimensions for the svg-like circle
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Load the sound
  const loadSound = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/time-tiktak.mp3'),
          { 
            shouldPlay: false, 
            volume: 0.5,
            isLooping: true // Set the sound to loop
          }
        );
        soundRef.current = sound;
        setSoundLoaded(true);
      }
    } catch (error) {
      console.error('Error loading tick sound:', error);
    }
  };
  
  // Load the sound when the component mounts
  useEffect(() => {
    loadSound();
    
    // Clean up audio resources on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  // Control sound playback based on timer state
  useEffect(() => {
    const controlSound = async () => {
      if (!soundLoaded || !soundRef.current) return;
      
      try {
        if (isActive && timeRemaining > 0) {
          const status = await soundRef.current.getStatusAsync();
          if (!status.isPlaying) {
            await soundRef.current.playAsync();
          }
        } else {
          const status = await soundRef.current.getStatusAsync();
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
          }
        }
      } catch (error) {
        console.error('Error controlling sound:', error);
      }
    };
    
    controlSound();
  }, [isActive, timeRemaining, soundLoaded]);
  
  // Update the animation when timeRemaining changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  }, [timeRemaining]);
  
  // Map animation value to stroke-dashoffset
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  
  // Add a separate animated value for opacity if needed
  const progressOpacity = animatedValue.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 1, 1],
  });
  
  return (
    <View style={[styles.mainContainer]}>
      <View style={[styles.container, { width: size, height: size }]}>
        {/* Background Circle */}
        <View style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]} />
        
        {/* Animated Progress Circle */}
        <Animated.View style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progressColor,
            opacity: progressOpacity, // Use separate opacity animation
            transform: [
              { rotateZ: '270deg' },
            ],
          },
        ]} />
        
        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { fontSize: isSmallDevice ? 28 : 32 }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotateZ: '-90deg' }],
  },
  timeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Raleway-Bold',
  },
});

export default CountdownTimer; 