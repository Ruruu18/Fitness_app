import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const Screen2 = () => {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <Image
        source={require('../../../assets/images/backdrop/2-B.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Start Your Journey</Text>
          <Text style={styles.subtitle}>Towards A More Active Lifestyle</Text>
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
    paddingBottom: isSmallDevice ? 80 : 120,
  },
  title: {
    fontFamily: 'Raleway-ExtraBold',
    fontSize: isSmallDevice ? 22 : 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Raleway-ExtraBold',
    fontSize: isSmallDevice ? 22 : 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Screen2;