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
    let runningCount = 0;
    let idleCount = 0;
    let stoppedCount = 0;
    let overspeedCount = 0;
    let unreachableCount = 0;

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

    const updatedStatusData = [
      {
        id: '1',
        status: 'All',
        backgroundColor: ['#007BFF', '#1a73e8'],
        data: totalActiveStatus,
      },
      {
        id: '2',
        status: 'Running',
        backgroundColor: ['#28A745', '#1dbe46'],
        data: runningCount,
      },
      {
        id: '3',
        status: 'Idle',
        backgroundColor: ['#FFC107', '#ffbb33'],
        data: idleCount,
      },
      {
        id: '4',
        status: 'Stopped',
        backgroundColor: ['#DC3545', '#e02e2e'],
        data: stoppedCount,
      },
      {
        id: '5',
        status: 'Overspeed',
        backgroundColor: ['#FD7E14', '#ff6a00'],
        data: overspeedCount,
      },
      {
        id: '6',
        status: 'Unreachable',
        backgroundColor: ['#6C757D', '#5a6268'],
        data: unreachableCount,
      },
    ];

    setStatusData(updatedStatusData);
  }, [data]);

  const renderItem = ({item}) => {
    if (item.status === 'All') {
      // Render the "All" status as a rectangle
      return (
        <View style={styles.rectangleContainer}>
          <LinearGradient
            colors={item.backgroundColor}
            style={styles.statusRectangle}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={styles.row}>
              <Icon name="directions-car" size={35} color="white" />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.statusText1}>{item.data}</Text>
          </LinearGradient>
        </View>
      );
    }
    // Render other statuses as squares
    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={item.backgroundColor}
          style={styles.statusSquare}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Icon name="directions-car" size={35} color="white" />
          <Text style={styles.statusText1}>{item.data}</Text>
        </LinearGradient>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        nestedScrollEnabled={true}
        data={statusData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.rowStyle}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        nestedScrollEnabled={true}
        data={statusData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.rowStyle}
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
    backgroundColor: '#f9f9f9',
  },

  listContainer: {
    justifyContent: 'center',
  },
  rowStyle: {
    justifyContent: 'space-between',
    // marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  rectangleContainer: {
    width: '100%',
    // alignItems: 'center',
    marginBottom: 16,
  },
  statusRectangle: {
    width: '95%', // Full width with padding
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    // alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: WIDTH * 0.42,
  },
  statusSquare: {
    width: WIDTH * 0.35,
    height: WIDTH * 0.35,
    borderRadius: 10, // Slightly rounded square
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textContainer: {
    // marginTop: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: RFValue(14),
    fontFamily: BOLD,
    color: 'black',
    marginLeft: 8,
  },
  statusText1: {
    fontSize: RFValue(18),
    fontFamily: BOLD,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default TripDetailsGrid;
