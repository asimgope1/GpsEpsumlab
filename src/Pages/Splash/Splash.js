import React, {useEffect, useRef} from 'react';
import {
  SafeAreaView,
  Animated,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {MyStatusBar} from '../../constants/config';
import {WHITE} from '../../constants/color';
import {HEIGHT, WIDTH} from '../../constants/config';

const Splash = ({navigation}) => {
  // Animated values for each circle's vertical and horizontal positions
  const circle1X = useRef(new Animated.Value(-50)).current;
  const circle1Y = useRef(new Animated.Value(-50)).current;

  const circle2X = useRef(new Animated.Value(WIDTH + 50)).current;
  const circle2Y = useRef(new Animated.Value(-50)).current;

  const circle3X = useRef(new Animated.Value(-50)).current;
  const circle3Y = useRef(new Animated.Value(-50)).current;

  const circle4X = useRef(new Animated.Value(WIDTH + 50)).current;
  const circle4Y = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Sequential animations for horizontal and vertical drop
    Animated.sequence([
      // Circle 1 animation
      Animated.parallel([
        Animated.timing(circle1X, {
          toValue: WIDTH / 4 - 100,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Y, {
          toValue: HEIGHT / 2.3, // Move to the center vertically
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Circle 2 animation
      Animated.parallel([
        Animated.timing(circle2X, {
          toValue: WIDTH / 2 + 95, // Move to 3/4th of the screen width
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Y, {
          toValue: HEIGHT / 3, // Move to the center vertically
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Circle 3 animation
      Animated.parallel([
        Animated.timing(circle3X, {
          toValue: WIDTH / 4 - 70, // Move to 1/4th of the screen width
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circle3Y, {
          toValue: HEIGHT / 2 + 140, // Slightly below center vertically
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Circle 4 animation
      Animated.parallel([
        Animated.timing(circle4X, {
          toValue: WIDTH / 2 - 15, // Move to 3/4th of the screen width
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circle4Y, {
          toValue: HEIGHT / 2 + 40, // Slightly below center vertically
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate to the next screen after animation
      navigation.navigate('Login');
    });
  }, []);

  return (
    <>
      <MyStatusBar
        backgroundColor={'rgba(100, 100, 100, 0.5)'}
        barStyle={'dark-content'}
      />
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/images/map1.jpeg')}
        style={styles.backgroundImage}>
        <SafeAreaView style={styles.container}>
          {/* Animated Circles */}
          <Animated.View
            style={[
              styles.circle1,
              {
                backgroundColor: WHITE,
                transform: [{translateX: circle1X}, {translateY: circle1Y}],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: WHITE,
                transform: [{translateX: circle2X}, {translateY: circle2Y}],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: WHITE,
                transform: [{translateX: circle3X}, {translateY: circle3Y}],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: WHITE,
                transform: [{translateX: circle4X}, {translateY: circle4Y}],
              },
            ]}
          />
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: WIDTH,
    height: HEIGHT,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
  },
  circle1: {
    width: 40,
    height: 40,
    borderRadius: 25,
    position: 'absolute',
  },
});
