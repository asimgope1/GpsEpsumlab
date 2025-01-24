import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {HEIGHT, WIDTH} from '../../constants/config';
import {BOLD, SEMIBOLD} from '../../constants/fontfamily';
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
        backgroundColor: ['#87CEEB', '#1E90FF'], // Deep blue to sky blue gradient
        data: totalActiveStatus,
      },
      {
        id: '2',
        status: 'Running',
        backgroundColor: ['#2A9D8F', '#33D9B2'], // Aqua green to light teal
        data: runningCount,
      },
      {
        id: '3',
        status: 'Idle',
        backgroundColor: ['#FFC300', '#FFD60A'], // Vibrant yellow gradient
        data: idleCount,
      },
      {
        id: '4',
        status: 'Stopped',
        backgroundColor: ['#E63946', '#FF6B6B'], // Crimson red to pastel red
        data: stoppedCount,
      },
      {
        id: '5',
        status: 'Overspeed',
        backgroundColor: ['#F4A261', '#E76F51'], // Peach to salmon gradient
        data: overspeedCount,
      },
      {
        id: '6',
        status: 'Unreachable',
        backgroundColor: ['#8D99AE', '#EDF2F4'], // Light grayish blue gradient
        data: unreachableCount,
      },
    ];

    setStatusData(updatedStatusData);
  }, [data]);

  const renderRectangle = () => {
    const rectangleData = statusData.find(item => item.status === 'All');
    if (!rectangleData) return null;

    return (
      <View style={styles.rectangleContainer}>
        <LinearGradient
          colors={rectangleData.backgroundColor}
          style={styles.statusRectangle}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.row}>
            <Text style={styles.statusTextRect}>{rectangleData.status}</Text>
            <Icon name="directions-car" size={35} color="white" />
          </View>
          <Text style={styles.statusText1Rect}>{rectangleData.data}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderCircleItem = ({item}) => (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={item.backgroundColor}
        style={styles.statusSquare}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon name="directions-car" size={25} color="white" />
        <Text style={styles.statusText1}>{item.data}</Text>
      </LinearGradient>
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const circleData = statusData.filter(item => item.status !== 'All');

  return (
    <View style={styles.container}>
      {/* Render Rectangle */}
      {renderRectangle()}

      {/* Render Circles */}
      <FlatList
        data={circleData}
        renderItem={renderCircleItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.circleListContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{justifyContent: 'space-between'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f0f0f0', // Light gray background color
    borderRadius: 15,
    marginBottom: 5,
    shadowColor: '#000', // Subtle shadow for the container
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  rectangleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Adds space between items
    paddingHorizontal: 100, // Optional: Add some padding for better spacing
    alignSelf: 'stretch',
    // marginBottom: 8,
  },

  statusRectangle: {
    width: '95%',
    paddingHorizontal: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  circleListContainer: {
    paddingHorizontal: 8,
    paddingTop: 10,
    backgroundColor: '#F4F7FB', // Light blue-gray gradient background
    borderRadius: 15,
    paddingBottom: 10,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: WIDTH * 0.29,
  },
  statusSquare: {
    width: WIDTH * 0.19,
    height: WIDTH * 0.19,
    borderRadius: WIDTH * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  statusText: {
    fontSize: RFValue(14),
    fontFamily: BOLD,
    color: '#2C3E50', // Dark slate blue for better contrast
  },
  statusTextRect: {
    fontSize: RFValue(30),
    fontFamily: SEMIBOLD,
    color: 'white',
    textAlign: 'center',
  },
  statusText1Rect: {
    fontSize: RFValue(30),
    fontFamily: BOLD,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  statusText1: {
    fontSize: RFValue(14),
    fontFamily: BOLD,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default TripDetailsGrid;
