import React from 'react';
import {View, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Track = ({showTrack, latitude, longitude, visible, onClose}) => {
  const region = {
    latitude: latitude || 28.6139, // Default to New Delhi
    longitude: longitude || 77.209,
    latitudeDelta: 0.05, // Zoom level
    longitudeDelta: 0.05,
  };

  const mapRef = React.useRef();

  React.useEffect(() => {
    if (showTrack?.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(showTrack, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  }, [showTrack]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}>
          {showTrack?.length > 0 && (
            <>
              <Marker
                coordinate={showTrack[0]}
                title="Start Point"
                pinColor="green"
              />
              <Marker
                coordinate={showTrack[showTrack.length - 1]}
                title="End Point"
                pinColor="red"
              />
            </>
          )}

          {showTrack?.length > 1 && (
            <Polyline
              coordinates={showTrack}
              strokeColor="blue"
              strokeWidth={5}
            />
          )}
        </MapView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  map: {
    flex: 1,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
});

export default Track;
