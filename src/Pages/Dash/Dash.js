import {
  View,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {Avatar, Icon} from '@rneui/themed';
import {BOLD, LIGHT, REGULAR, SEMIBOLD} from '../../constants/fontfamily';
import {HEIGHT, WIDTH} from '../../constants/config';
import {clearAll} from '../../utils/Storage';
import {checkuserToken} from '../../redux/actions/auth';
import {useDispatch} from 'react-redux';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import {BASE_URL, ws_baseurl} from '../../constants/url';
import TripDetailsGrid from '../VehicleMap/TripDetailsGrid';
import {BLACK} from '../../constants/color';
import {RFValue} from 'react-native-responsive-fontsize';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import Track from '../Track/Track';
import LinearGradient from 'react-native-linear-gradient';
import HistoryModal from '../History/HistoryModal';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Loader} from '../../components/Loader';

const Dash = ({}) => {
  const [vehicleData, setVehicleData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [History, setHistory] = useState(false); // History state
  const [viewHistory, setViewHistory] = useState(false); //
  const [selectedValue, setSelectedValue] = useState({});
  const [Location, setLocation] = useState([]); // Location state
  const [datalog, setDatalog] = useState({});

  const navigation = useNavigation();
  const Dispatch = useDispatch();
  const [showMap, setShowMap] = React.useState(false);
  const [showTrack, setShowTrack] = React.useState([]);
  const websocket = useRef(null);
  const [User, setUser] = useState([]);
  const [dates, setDates] = useState({fromDate: '', toDate: ''});
  const [Log, SetLog] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [initialData, setInitialData] = useState([]);
  const [status, setStatus] = useState('');
  const [latestData, setLatestData] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [data, setData] = useState([]);
  const [pageLoad, setPageLoad] = useState(false);

  // Fetch data at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      GetDerivedData();
    }, 1000000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [initialData]); // Depend on `initialData` for updates

  const handleDateSelect = (type, date) => {
    setDates(prev => ({...prev, [type]: date}));
  };
  const onRefresh = () => {
    setRefreshing(true);
    GetDerivedData();
    // setRefreshing(false);
    // setRefreshing(!refreshing); // Toggle refresh state
    // if (refreshing) {
    //   GetDerivedData();
    // }
  };
  const handleClose = () => {
    setShowMap(false); // Hide the map when close button is pressed
  };

  const GetSelectedVehicle = item => {
    setPageLoad(true);
    const Url = `${BASE_URL}things/?thing_id=${item}&project_id=117`;
    // console.log('item GetSelectedVehicle', item);

    GETNETWORK(Url, true)
      .then(response => {
        // console.log(
        //   'GetSelectedVehicle inside',
        //   response.data.derived_live_config,
        // );
        setSelectedValue(response.data.derived_live_config); // Set the nested object directly if needed
        setLocation(response.data.derived_live_config.location);
        setLoading(false);
      })
      .catch(error => {
        setPageLoad(false);
        setLoading(false);
        setError('Failed to fetch data');
        console.error('Error fetching data: ', error);
      });
  };

  useEffect(() => {
    GetDerivedData();
    GetUser();
  }, []); // Only run once when the component mounts

  // useEffect(() => {
  //   // GetDerivedData();
  //   // GetUser();
  //   const interval1 = setInterval(() => {
  //     // GetDerivedData();
  //     console.log('Checking vehicle status every first seconds...');
  //   }, 10000);
  //   const interval2 = setInterval(() => {
  //     console.log('Checking vehicle status every 15 seconds...');
  //   }, 15000);
  //   const interval3 = setInterval(() => {
  //     console.log('Performing another operation every 30 seconds...');
  //   }, 30000);
  //   return () => {
  //     clearInterval(interval1);
  //     clearInterval(interval2);
  //     clearInterval(interval3);
  //   };
  // }, []);

  const GetDerivedData = async () => {
    const Url = `${BASE_URL}projects/117/things/?page=1&search=&type=gps`;
    setPageLoad(true);

    try {
      const response = await GETNETWORK(Url, true);
      console.log('API response:', response.data.things);

      setLoading(false);
      setPageLoad(false);

      if (response.data && response.data.things) {
        const fetchedData = response.data.things.map(item => ({
          thing_id: item.thing_id,
          updated_on: new Date(item.updated_on), // Convert `updated_on` to Date object
        }));

        // Compare timestamps and determine status
        setData(prevData => {
          const currentTime = new Date();
          const statusUpdates = {
            Running: 0,
            Stopped: 0,
            Unreachable: 0,
          };

          fetchedData.forEach(latestItem => {
            const {thing_id, updated_on} = latestItem;

            // Calculate the time difference in minutes
            const timeDifference = (currentTime - updated_on) / (1000 * 60); // Convert ms to minutes

            if (timeDifference <= 2) {
              statusUpdates[thing_id] = 'Running';
              statusUpdates.Running += 1;
            } else if (timeDifference > 2 && timeDifference <= 5) {
              statusUpdates[thing_id] = 'Stopped';
              statusUpdates.Stopped += 1;
            } else {
              statusUpdates[thing_id] = 'Unreachable';
              statusUpdates.Unreachable += 1;
            }
          });

          // console.log('Number of Unreachable Vehicles:', unreachableCount);
          console.log('Vehicle Status Map:', statusUpdates);
          setStatusMap(prev => ({...prev, ...statusUpdates}));

          return fetchedData; // Update the latest data
        });

        setVehicleData(response.data.things); // Update vehicle data
        setRefreshing(false); // Stop refreshing
        setPageLoad(false);
      } else {
        setError('No data available');
        setPageLoad(false);
      }
    } catch (error) {
      setLoading(false);
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
      setPageLoad(false);
    }
  };

  const mapApi = async id => {
    const url = `${BASE_URL}things/datalog/`;
    setPageLoad(true);

    // Get today's date in 'YYYY-MM-DD' format
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Extract the date portion

    const payload = {
      from_date: todayDate, // Use today's date
      project: '117',
      thing_id: id,
      to_date: todayDate, // Use today's date for "to_date" as well
    };

    try {
      const response = await POSTNETWORK(url, payload, true); // Pass true for token-based auth

      if (response?.data?.length > 0) {
        // Get the last element from the array
        const latestData = response.data[response.data.length - 1];
        // Extract relevant details
        const {derived_data, timestamp} = latestData;
        const {
          location,
          speed,
          status,
          today_distance,
          total_distance,
          acceleration,
        } = derived_data;

        // Update state or variables with the latest details, including the timestamp
        const vehicleDetails = {
          location: {latitude: location[0], longitude: location[1]},
          speed,
          status,
          current_distance: today_distance,
          total_distance: total_distance,
          generated_datetime: timestamp, // Add the timestamp
          acceleration,
        };

        console.log('Updated Vehicle Details:', vehicleDetails);
        console.log('selected Vehicle Details:', selectedValue);
        setSelectedValue(vehicleDetails);
        setPageLoad(false);

        // Update the polyline state
        const locationData = response.data.map(item => {
          const [lat, lon] = item.derived_data.location; // Extract latitude and longitude
          return {latitude: lat, longitude: lon};
        });

        setShowTrack(locationData); // Pass location data to the state for rendering
      } else {
        console.log('No data available for the selected date.');
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const connectWebSocket = thingid => {
    const WEBSOCKET_URL = `${ws_baseurl}/thing/r/${thingid}/`;
    setPageLoad(true);
    console.log('Connecting to WebSocket:', WEBSOCKET_URL); // Log WebSocket URL

    websocket.current = new WebSocket(WEBSOCKET_URL);

    websocket.current.onopen = () => {
      console.log('WebSocket connected:'); // Log connection success
    };

    websocket.current.onmessage = onMessage;
    websocket.current.onclose = onClose;
    websocket.current.onerror = onError;
  };

  const onMessage = event => {
    setPageLoad(true);
    try {
      // Parse the incoming message
      const json_data = JSON.parse(event.data);
      console.log('Parsed data:', json_data);

      // Extract derived values from the message
      const {derived_values, timestamp} = json_data?.message || {};
      const {
        location,
        speed,
        status,
        today_distance,
        total_distance,
        acceleration,
      } = derived_values || {};

      // Update the datalog state with the extracted data
      const updatedDatalog = {
        location: {latitude: location[0], longitude: location[1]},
        speed,
        status,
        current_distance: today_distance,
        total_distance: total_distance,
        generated_datetime: timestamp,
        acceleration,
      };

      // Log the updated datalog for debugging
      console.log('Updated datalog:', updatedDatalog);

      // Set the updated datalog state
      setDatalog(updatedDatalog);
      setPageLoad(false);
    } catch (error) {
      console.error('Error processing onMessage:', error);
      setPageLoad(false);
    }
  };

  // WebSocket close event handler
  const onClose = event => {
    console.log('WebSocket closed:', event.code, event.reason);
    setPageLoad(false);
  };

  // WebSocket error event handler
  const onError = event => {
    console.error('WebSocket error:', event.message);
    setPageLoad(false);
  };

  const GetUser = async () => {
    const url = `${BASE_URL}user/profile/`;
    setPageLoad(true);

    try {
      const response = await GETNETWORK(url, true); // Use GETNETWORK with token-based auth
      console.log(
        'Response from API:',
        response.data.organisation[0]?.org_logo_path,
      );
      setUser(response?.data);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const renderLoading = () => (
    <SafeAreaView style={styles.loadingContainer}>
      <Text>Loading...</Text>
    </SafeAreaView>
  );

  const renderError = () => (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </SafeAreaView>
  );

  const renderVehicleCard = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        GetSelectedVehicle(item.thing_id);
        connectWebSocket(item.thing_id);
        mapApi(item.thing_id);
        SetLog(item.thing_id);

        setHistory(true);
        setShowModal(true);
      }}
      style={styles.cardContainer}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={{...styles.row}}>
          <View style={styles.row}>
            <Icon
              name="directions-car"
              type="MaterialIcons"
              color={
                statusMap[item.thing_id] === 'Running'
                  ? '#28A745'
                  : statusMap[item.thing_id] === 'Stopped'
                  ? '#DC3545'
                  : statusMap[item.thing_id] === 'Unreachable'
                  ? '#6C757D'
                  : '#007BFF'
              }
              size={30}
              style={styles.icon}
            />

            <View>
              <Text style={{...styles.cardTitle}}>{item.thing_name}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardLabel}>Vehicle No: </Text>
            <Text style={styles.cardValue}>
              {item.properties.default_properties.vehicle_no}
            </Text>
          </View>
        </View>
        {/* Separation Line */}
        <Text
          style={{
            ...styles.cardValue,
            fontSize: 13,
            color: 'grey',
            marginLeft: 10,
          }}>
          {moment(item.derived_live_config.received_datetime).format(
            'DD/MM/YYYY h:mm a',
          )}
        </Text>
        <View style={styles.separator} />
      </View>

      {/* Card Body */}
      {/* Row 1: Vehicle Type and Driver */}
      <View style={styles.row}>
        <View style={styles.row}>
          <View style={styles.rowWithIcon}>
            <Icon
              name="check-circle"
              type="MaterialIcons"
              color="#316163"
              size={23}
              style={styles.icon}
            />
            <Text style={{...styles.cardLabel}}>Status: </Text>
          </View>
          <Text style={{...styles.cardValue}}>
            {item.derived_live_config.status}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowWithIcon}>
            <Icon
              name="account-circle"
              type="MaterialIcons"
              color="#316163"
              size={23}
              style={styles.icon}
            />
            <Text style={styles.cardLabel}>Driver: </Text>
          </View>
          <Text style={styles.cardValue}>{item.desc}</Text>
        </View>
      </View>

      {/* Row 2: Status and Speed */}
      <View style={styles.row}>
        <View style={styles.row}>
          <View style={styles.rowWithIcon}>
            <Icon
              name="trending-up"
              type="MaterialIcons"
              color="#316163"
              size={23}
              style={styles.icon}
            />
            <Text style={styles.cardLabel}>Acc: </Text>
          </View>
          <Text style={styles.cardValue}>
            {item?.derived_live_config?.acceleration?.toFixed(2)} m/s²
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowWithIcon}>
            <Icon
              name="speed"
              type="MaterialIcons"
              color="#316163"
              size={23}
              style={styles.icon}
            />
            <Text style={styles.cardLabel}>Speed: </Text>
          </View>
          <Text style={styles.cardValue}>
            {item?.derived_live_config?.speed?.toFixed(2) || '0.00'} km/h
          </Text>
        </View>
      </View>

      {/* Row 3: Acceleration and Total Distance */}
      <View style={styles.row}></View>
      <View style={styles.rowWithIcon}>
        <Icon
          name="straighten"
          type="MaterialIcons"
          color="#316163"
          size={23}
          style={styles.icon}
        />
        <Text style={styles.cardLabel}>Total Dist: </Text>
        <Text style={styles.cardValue}>
          {(item.derived_live_config.total_distance / 1000).toFixed(2)} km
        </Text>
      </View>

      {/* Row 4: Current Distance and Updated On */}
      <View style={styles.row}>
        <View style={styles.row}>
          <View style={styles.rowWithIcon}>
            <Icon
              name="place"
              type="MaterialIcons"
              color="#316163"
              size={23}
              style={styles.icon}
            />
            <Text style={styles.cardLabel}>Current Dist: </Text>
          </View>
          <Text style={styles.cardValue}>
            {(item.derived_live_config.current_distance / 1000).toFixed(2)} km
          </Text>
        </View>
      </View>
      <View style={styles.rowWithIcon}></View>
    </TouchableOpacity>
  );

  //   console.log('Location', Location);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#316163" />
      <LinearGradient
        colors={['#316163', '#4db6b3']} // Light pink to dark red gradient
        style={{flex: 1}}
        start={{x: 0, y: 0}} // Start from top-left corner
        end={{x: 1, y: 1}} // End at bottom-right corner
        locations={[0, 1]} // Gradient stops
      >
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header Container */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '99%',
              // elevation: 25,

              // elevation: 5,
              paddingVertical: 25,
              paddingHorizontal: 10,
              // backgroundColor: '#4db6b3',
              alignSelf: 'center',
              // shadowColor: '#000',
              // shadowOffset: {width: 0, height: 2},
              // shadowOpacity: 0.25,
              // shadowRadius: 3.5,
              // borderRadius: 8,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {User && (
                <Avatar
                  size="medium"
                  rounded
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/1.jpg',
                  }}
                />
              )}
              <Text
                style={{
                  color: 'white',
                  // fontWeight: 'bold',
                  fontFamily: BOLD,
                  fontSize: 15,
                  marginLeft: 10,
                }}>
                Welcome, {User?.name}
                {'\n'}
                Last login:{' '}
                {moment(User?.last_active).format('DD/MM/YYYY h:mm a')}
              </Text>
            </View>
            <Icon
              onPress={() => {
                clearAll();
                Dispatch(checkuserToken());
              }}
              name="logout"
              type="AntDesign"
              color="white"
              size={25}
            />
          </View>
          <GestureHandlerRootView>
            <ScrollView
              contentContainerStyle={{flexGrow: 1}}
              scrollEnabled={true}>
              <View style={{flex: 1, alignItems: 'center', width: '100%'}}>
                <View
                  style={{
                    height: HEIGHT * 0.5,
                  }}>
                  <TripDetailsGrid data={statusMap} />
                </View>

                <View
                  style={{
                    backgroundColor: '#C5CED3',
                    paddingVertical: 15,
                    paddingHorizontal: 10,
                    borderTopRightRadius: 25,
                    borderTopLeftRadius: 25,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.5,
                    // elevation: 5,
                    flex: 1,
                  }}>
                  {/* Display content */}
                  {loading ? (
                    renderLoading()
                  ) : error ? (
                    renderError()
                  ) : (
                    <View
                      style={{
                        height: HEIGHT * 0.55,
                        width: WIDTH * 0.95,
                        alignSelf: 'center',
                      }}>
                      <FlatList
                        nestedScrollEnabled={true}
                        data={vehicleData}
                        renderItem={renderVehicleCard}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{
                          width: '100%',
                          paddingHorizontal: 10,
                        }}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['black']}
                          />
                        }
                      />
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </GestureHandlerRootView>
        </KeyboardAvoidingView>

        {showMap &&
        Array.isArray(Location) &&
        Location.length > 0 &&
        Location[0] !== undefined &&
        Location[1] !== undefined ? (
          <View style={{flex: 1}}>
            <Track
              showTrack={showTrack}
              latitude={Location[0]} // Pass the latitude value
              longitude={Location[1]} // Pass the longitude value
              onClose={handleClose} // Handle close functionality
            />
          </View>
        ) : (
          showMap &&
          Alert.alert(
            'Invalid Location',
            'Location data is not available. Cannot track.',
            [{text: 'OK'}],
          )
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => {
            setShowModal(false);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Vehicle Details</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    onPress={() => {
                      // setHistory(true);
                      setViewHistory(true);
                      // navigation.navigate('History');
                      //   console.log('History pressed');
                    }}>
                    <Text
                      style={{
                        ...styles.headerButton,
                        color: '#316163',
                        fontSize: RFValue(12),
                      }}>
                      History
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowMap(true);
                      //   console.log('Track pressed');
                    }}>
                    <Text style={styles.headerButton}>Track</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setViewHistory(false);
                      setShowModal(false);
                    }}>
                    <Text style={styles.headerButton}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Separation Line */}
              <View style={styles.separator} />

              {/* Modal Content */}
              <View style={styles.modalContent}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <View style={styles.detailRow}>
                    <View style={styles.rowWithIcon}>
                      <Icon
                        name="speed"
                        type="MaterialIcons"
                        color="#316163"
                        size={30}
                        style={styles.icon}
                      />
                      <Text style={styles.detailLabel}>Speed: </Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedValue?.speed?.toFixed(2) ?? 'N/A'} km/h
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.rowWithIcon}>
                      <Icon
                        name="trending-up"
                        type="MaterialIcons"
                        color="#316163"
                        size={30}
                        style={styles.icon}
                      />
                      <Text style={styles.detailLabel}>Acc: </Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedValue?.acceleration?.toFixed(2) ?? 'N/A'} m/s²
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <View style={styles.detailRow}>
                    <View style={styles.rowWithIcon}>
                      <Icon
                        name="straighten"
                        type="MaterialIcons"
                        color="#316163"
                        size={30}
                        style={styles.icon}
                      />
                      <Text style={styles.detailLabel}>Total Dist: </Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedValue?.total_distance?.toFixed(2) / 1000 ??
                        'N/A'}{' '}
                      km
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <View style={styles.detailRow}>
                    <View style={styles.rowWithIcon}>
                      <Icon
                        name="place"
                        type="MaterialIcons"
                        color="#316163"
                        size={30}
                        style={styles.icon}
                      />
                      <Text style={styles.detailLabel}>Current Dist: </Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedValue?.current_distance?.toFixed(2) / 1000 ??
                        'N/A'}{' '}
                      km
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.rowWithIcon}>
                    <Icon
                      name="update"
                      type="MaterialIcons"
                      color="#316163"
                      size={30}
                      style={styles.icon}
                    />
                    <Text style={styles.detailLabel}>Last Updated: </Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {selectedValue?.generated_datetime
                      ? moment(selectedValue.generated_datetime).format(
                          'DD/MM/YYYY h:mm a',
                        )
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <HistoryModal
          visible={viewHistory}
          onClose={() => setViewHistory(false)}
          onDateSelect={handleDateSelect}
          vehicleData={vehicleData}
          log={Log}
        />
      </LinearGradient>
      <Loader visible={pageLoad} />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cardContainer: {
    width: WIDTH * 0.94,
    height: HEIGHT * 0.4,
    alignSelf: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: BOLD,
    color: '#316163',
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: SEMIBOLD,

    color: '#333',
    margin: 2,
  },
  cardValue: {
    fontSize: 16,
    color: 'black',
    fontFamily: REGULAR,
    // marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#316163',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#316163',
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  modalContent: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555',
  },
});

export default Dash;
