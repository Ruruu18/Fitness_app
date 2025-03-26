import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen1 from './onboarding/Screen1';
import Screen2 from './onboarding/Screen2';
import Screen3 from './onboarding/Screen3';
import { useNavigation } from '@react-navigation/native';

const screens = [
  { id: 1, component: Screen1 },
  { id: 2, component: Screen2 },
  { id: 3, component: Screen3 },
];

// Get dimensions and calculate responsive sizes
const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [showLoading, setShowLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'Radley-Regular': require('../../assets/fonts/Radley-Regular.ttf'),
    'Raleway-ExtraBold': require('../../assets/fonts/Raleway-ExtraBold.ttf'),
    'Raleway-Bold': require('../../assets/fonts/Raleway-Bold.ttf'),
    'Raleway-SemiBold': require('../../assets/fonts/Raleway-SemiBold.ttf'),
  });

  // Listen for dimension changes
  useEffect(() => {
    const updateLayout = () => {
      // Reset animation when orientation changes
      slideAnimation.setValue(-(currentSlideIndex) * width);
    };

    const dimensionsListener = Dimensions.addEventListener('change', updateLayout);

    return () => {
      dimensionsListener.remove();
    };
  }, [currentSlideIndex, width]);

  useEffect(() => {
    if (!showLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [showLoading]);

  const handleNext = () => {
    if (currentSlideIndex < screens.length - 1) {
      Animated.timing(slideAnimation, {
        toValue: -(currentSlideIndex + 1) * width,
        duration: 350,
        useNativeDriver: true,
      }).start();
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleSkip = () => {
    Animated.timing(slideAnimation, {
      toValue: -(screens.length - 1) * width,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setCurrentSlideIndex(screens.length - 1);
  };

  if (!fontsLoaded) {
    return null;
  }

  if (showLoading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <Screen1 onComplete={() => setShowLoading(false)} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.slidesContainer,
            { 
              width: screens.length * width,
              transform: [{ translateX: slideAnimation }] 
            }
          ]}
        >
          {screens.map(({ id, component: ScreenComponent }, index) => (
            <View key={id} style={[styles.slide, { width }]}>
              <ScreenComponent />
            </View>
          ))}
        </Animated.View>
        
        <SafeAreaView edges={['bottom']} style={styles.navigationWrapper}>
          <View style={styles.navigationContainer}>
            <View style={styles.dotsContainer}>
              {screens.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, currentSlideIndex === index && styles.activeDot]}
                />
              ))}
            </View>
            <View style={styles.buttonsContainer}>
              {currentSlideIndex < screens.length - 1 ? (
                <>
                  <TouchableOpacity onPress={handleSkip} style={styles.button}>
                    <Text style={styles.buttonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNext} style={[styles.button, styles.nextButton]}>
                    <Text style={[styles.buttonText, styles.nextButtonText]}>Next</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.button, styles.getStartedButton]}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>Get Started</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  slide: {
    flex: 1,
    height: '100%',
  },
  navigationWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 15 : 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FD904D',
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: isSmallDevice ? 8 : 12,
    paddingHorizontal: isSmallDevice ? 16 : 24,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: isSmallDevice ? 16 : 20,
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#FD904D',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  getStartedButton: {
    backgroundColor: '#FD904D',
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
});

export default OnboardingScreen;