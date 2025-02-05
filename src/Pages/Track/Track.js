import React, {useState, useEffect, useRef} from 'react';
import {View, Modal, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MapView, {Polyline, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Track = ({
  showTrack,
  latitude,
  longitude,
  visible,
  onClose,
  projectedTrack,
}) => {
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef();

  const region = {
    latitude: latitude || 28.6139, // Default to New Delhi
    longitude: longitude || 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    const getDirections = async () => {
      const origin = `${latitude},${longitude}`;
      const destination = `${
        projectedTrack[projectedTrack.length - 1].latitude
      },${projectedTrack[projectedTrack.length - 1].longitude}`;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyChAFxD34j5ryAcBSmWtDlCGOg3AQ6Vu8w`,
        );
        const result = await response.json();
        console.log('Directions:', result);
        console.log('geocoded_waypoints:', result.geocoded_waypoints);

        if (result.routes && result.routes.length > 0) {
          const points = decodePolyline(
            result.routes[0].overview_polyline.points,
          );
          setDirections(points);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching directions:', error);
        setLoading(false);
      }
    };

    getDirections();
  }, [latitude, longitude, projectedTrack]);

  // Decode the polyline string to get coordinates
  const decodePolyline = encoded => {
    let points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = (result & 0x1f) % 180;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = (result & 0x1f) % 180;
      lng += deltaLng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // Render the directions polyline once decoded
  useEffect(() => {
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}

        {/* Map */}
        {!loading && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            mapType="hybrid">
            {/* Render Start and End Markers */}
            {showTrack?.length > 0 && (
              <>
                <Marker
                  coordinate={showTrack[0]}
                  title="Start Point"
                  pinColor="green"
                  description={`${showTrack[0].latitude}, ${showTrack[0].longitude}`}
                />
                <Marker
                  coordinate={showTrack[showTrack.length - 1]}
                  title="End Point"
                  pinColor="red"
                  description={`${showTrack[showTrack.length - 1].latitude}, ${
                    showTrack[showTrack.length - 1].longitude
                  }`}
                />
              </>
            )}

            {/* Render Actual Route */}
            {showTrack?.length > 1 && (
              <Polyline
                coordinates={showTrack}
                strokeColor="blue"
                strokeWidth={5}
              />
            )}

            {/* Render Projected Route */}
            {projectedTrack?.length > 1 && (
              <Polyline
                coordinates={projectedTrack}
                strokeColor="rgba(255, 165, 0, 0.8)" // Orange color for projection
                strokeWidth={4}
                lineDashPattern={[10, 5]} // Dashed Line
              />
            )}

            {/* Render Directions Polyline */}
            {directions && (
              <Polyline
                coordinates={directions}
                strokeColor="blue"
                strokeWidth={5}
              />
            )}
          </MapView>
        )}
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
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Track;
