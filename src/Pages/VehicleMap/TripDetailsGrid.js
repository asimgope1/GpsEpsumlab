import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {HEIGHT, WIDTH} from '../../constants/config';
import {BOLD} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';

const TripDetailsGrid = ({data}) => {
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    // Initialize status counts
    let runningCount = 0;
    let idleCount = 0;
    let stoppedCount = 0;
    let overspeedCount = 0;
    let unreachableCount = 0;

    // Iterate through the data to count each status
    Object.keys(data).forEach(key => {
      const status = data[key];

      switch (status) {
        case 'Running':
          runningCount += 1;
          break;
        case 'Idle':
          idleCount += 1;
          break;
        case 'Stopped':
          stoppedCount += 1;
          break;
        case 'Overspeed':
          overspeedCount += 1;
          break;
        case 'Unreachable':
          unreachableCount += 1;
          break;
        default:
          break;
      }
    });

    const totalActiveStatus = runningCount + stoppedCount + unreachableCount;

    // Update the statusData with the calculated counts
    const updatedStatusData = [
      {
        id: '1',
        status: 'All',
        backgroundColor: ['#007BFF', '#1a73e8'],
        data: totalActiveStatus, // Total count of all things
      },
      {
        id: '2',
        status: 'Running',
        backgroundColor: ['#28A745', '#1dbe46'],
        data: runningCount, // Count of Running status
      },
      {
        id: '3',
        status: 'Idle',
        backgroundColor: ['#FFC107', '#ffbb33'],
        data: idleCount, // Count of Idle status
      },
      {
        id: '4',
        status: 'Stopped',
        backgroundColor: ['#DC3545', '#e02e2e'],
        data: stoppedCount, // Count of Stopped status
      },
      {
        id: '5',
        status: 'Overspeed',
        backgroundColor: ['#FD7E14', '#ff6a00'],
        data: overspeedCount, // Count of Overspeed status
      },
      {
        id: '6',
        status: 'Unreachable',
        backgroundColor: ['#6C757D', '#5a6268'],
        data: unreachableCount, // Count of Unreachable status
      },
    ];

    setStatusData(updatedStatusData); // Update the state with the new status data
  }, [data]); // Re-run when `data` prop changes

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
