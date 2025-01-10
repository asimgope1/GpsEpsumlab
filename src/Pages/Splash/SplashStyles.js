import { StyleSheet } from 'react-native';
import { WHITE } from '../../constants/color';
import { HEIGHT, WIDTH } from '../../constants/config';
export const splashStyles = StyleSheet.create({
  maincontainer: {
    height: '100%',
    width: '100%',
    backgroundColor: WHITE,
  },
  logoContainer: {
    width: WIDTH * 0.6,
    height: HEIGHT * 0.15,
    alignItems: 'center',
  },
});
