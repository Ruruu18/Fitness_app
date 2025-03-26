import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const Screen1 = ({ onComplete }) => {
  const welcomeOpacity = new Animated.Value(0);
  const welcomeTranslateY = new Animated.Value(50);
  const titleTranslateY = new Animated.Value(50);
  const subtitleOpacity = new Animated.Value(0);
  const subtitleTranslateY = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onComplete();
      }, 2000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <Image
        source={require('../../../assets/images/backdrop/2-A.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Animated.Text 
            style={[
              styles.welcomeText, 
              { 
                opacity: welcomeOpacity,
                transform: [{ translateY: welcomeTranslateY }]
              }
            ]}
          >
            Welcome to
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.title,
              { transform: [{ translateY: titleTranslateY }] }
            ]}
          >
            HUGE
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.subtitle, 
              { 
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }]
              }
            ]}
          >
            Achieve your body goals with us
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingVertical: isSmallDevice ? 20 : 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: isSmallDevice ? 40 : 80,
  },
  welcomeText: {
    fontFamily: 'Radley-Regular',
    fontSize: isSmallDevice ? 20 : 24,
    color: '#FD904D',
    textAlign: 'center',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Raleway-ExtraBold',
    fontSize: isSmallDevice ? 48 : 64,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Radley-Regular',
    fontSize: isSmallDevice ? 14 : 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default Screen1;