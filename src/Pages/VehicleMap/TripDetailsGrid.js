import {View, StyleSheet, FlatList, Text} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import {HEIGHT, WIDTH} from '../../constants/config';
import {BOLD} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const TripDetailsGrid = ({data}) => {
  const countAll = data?.data?.things.length || 0; // Total count of all things
  const countStopped =
    data?.data?.things.filter(
      item => item.derived_live_config?.status === 'STOPPED',
    ).length || 0; // Count of 'STOPPED' status

  const statusData = [
    {
      id: '1',
      status: 'All',
      backgroundColor: ['#007BFF', '#1a73e8'],
      data: data?.count,
    }, // Bright Blue gradient
    {id: '2', status: 'Running', backgroundColor: ['#28A745', '#1dbe46']}, // Dark Green gradient
    {id: '3', status: 'Idle', backgroundColor: ['#FFC107', '#ffbb33']}, // Amber gradient
    {
      id: '4',
      status: 'Stopped',
      backgroundColor: ['#DC3545', '#e02e2e'],
      data: countStopped,
    }, // Dark Red gradient
    {id: '5', status: 'Overspeed', backgroundColor: ['#FD7E14', '#ff6a00']}, // Deep Orange gradient
    {id: '6', status: 'Unreachable', backgroundColor: ['#6C757D', '#5a6268']}, // Gray gradient
  ];

  const renderItem = ({item}) => (
    <LinearGradient
      colors={item.backgroundColor} // Apply gradient colors
      style={styles.statusCard}
      start={{x: 0, y: 0}} // Gradient starts from top-left corner
      end={{x: 1, y: 1}} // Gradient ends at bottom-right corner
    >
      <Icon name="directions-car" size={35} color="white" />
      <View style={{marginTop: 5}}>
        <Text style={styles.statusText}>{item.status}</Text>
        <Text style={styles.statusText1}>{item.data}</Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <FlatList
        nestedScrollEnabled={true}
        data={statusData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2} // Defines grid layout with 2 columns
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.rowStyle} // Styling for each row
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  listContainer: {
    justifyContent: 'center',
  },
  rowStyle: {
    justifyContent: 'space-between', // Adjusts spacing between columns
    marginBottom: 10, // Space between rows
  },
  statusCard: {
    width: WIDTH * 0.4, // Slightly less than half the screen width
    height: HEIGHT * 0.12, // Adjust card height
    margin: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  statusText: {
    fontSize: 14,
    fontFamily: BOLD,
    color: 'white',
    textAlign: 'center',
  },
  statusText1: {
    fontSize: RFValue(17),
    fontFamily: BOLD,
    color: 'white',
    textAlign: 'center',
  },
});

export default TripDetailsGrid;
