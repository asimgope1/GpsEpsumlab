import React, { Fragment, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BRAND, GRAY, GREEN, WHITE } from '../../constants/color';
import { LOGO, TATA } from '../../constants/imagepath';
import { HEIGHT, MyStatusBar, WIDTH } from '../../constants/config';
import { splashStyles } from './SplashStyles';

const Splash = ({ navigation }) => {
  // Animated values for scaling and positioning
  const logoScale = useRef(new Animated.Value(1.5)).current;
  const tataScale = useRef(new Animated.Value(1.5)).current;
  const logoTranslateY = useRef(new Animated.Value(50)).current;
  const tataTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Run both scale and translate animations in parallel
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(tataScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(tataTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to the login screen once the animation is complete
      navigation.navigate('Login');
    });
  }, []);

  return (
    <Fragment>
      <MyStatusBar backgroundColor={GRAY} barStyle={'dark-content'} />
      <SafeAreaView style={splashStyles.maincontainer}>
        <LinearGradient
          end={{ x: 0, y: 0 }}
          start={{ x: 0, y: 1 }}
          colors={[GREEN, GRAY]}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              ...splashStyles.logoContainer,
              width: WIDTH * 0.9,
              height: HEIGHT * 0.2,
              marginBottom: HEIGHT * 0.2,
            }}>
            {/* TATA Image with scale and translate animations */}
            <Animated.Image
              source={{}}
              style={{
                width: WIDTH * 0.8,
                height: HEIGHT * 0.2,
                tintColor: BRAND,
                transform: [{ scale: tataScale }, { translateY: tataTranslateY }],
              }}
              resizeMode="contain"
            />
            {/* LOGO Image with scale and translate animations */}
            <Animated.Image
              source={{}}
              style={{
                width: WIDTH * 0.8,
                height: HEIGHT * 0.08,
                tintColor: BRAND,
                transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
              }}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Fragment>
  );
};

export default Splash;
