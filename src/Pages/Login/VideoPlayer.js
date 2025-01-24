import {View, Text, StyleSheet} from 'react-native';
import React, {useRef} from 'react';
import Video, {VideoRef} from 'react-native-video';

const VideoPlayer = () => {
  const background = require('../../assets/images/truckVideo.gif');

  return (
    <Video
      source={background}
      style={{...styles.backgroundVideo}}
      resizeMode="cover"
      repeat={true}
    />
  );
};

// Later on in your styles..
var styles = StyleSheet.create({
  backgroundVideo: {
    width: '100%',
    height: '100%',
    color: 'transparent',
    backgroundColor: 'transparent',
  },
});

export default VideoPlayer;
