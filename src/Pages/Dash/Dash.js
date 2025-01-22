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
  const [data, setData] = useState();
  const navigation = useNavigation();
  const Dispatch = useDispatch();
  const [showMap, setShowMap] = React.useState(false);
  const [showTrack, setShowTrack] = React.useState([]);
  const websocket = useRef(null);
  const [User, setUser] = useState([]);
  const [dates, setDates] = useState({fromDate: '', toDate: ''});
  const [Log, SetLog] = useState();
  const [refreshFlag, setRefreshFlag] = useState({});

  const vehicleDat = {
    speed: '80 km/h',
    status: 'Active',
    acceleration: '2.5 m/s²',
    todayDistance: '50 km',
    totalDistance: '5000 km',
    currentDistance: '20 km',
    lastUpdated: '1 min ago',
  };
  const handleDateSelect = (type, date) => {
    setDates(prev => ({...prev, [type]: date}));
  };

  const handleClose = () => {
    setShowMap(false); // Hide the map when close button is pressed
  };

  const GetSelectedVehicle = item => {
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
        setLoading(false);
        setError('Failed to fetch data');
        console.error('Error fetching data: ', error);
      });
  };

  // const GetSelectedVehicle = item => {
  //   const Url = `${BASE_URL}things/?thing_id=${item}&project_id=117`;

  //   GETNETWORK(Url, true)
  //     .then(response => {
  //       if (response.data && response.data.derived_live_config) {
  //         const updatedData = response.data.derived_live_config;

  //         // Update selected vehicle data and location separately
  //         setSelectedValue(prevState => ({
  //           ...prevState, // Spread previous state to retain other properties
  //           ...updatedData, // Update with new data
  //         }));

  //         setLocation(updatedData.location); // Ensure location is updated
  //         setLoading(false);
  //       } else {
  //         setLoading(false);
  //         setError('No vehicle data available');
  //       }
  //     })
  //     .catch(error => {
  //       setLoading(false);
  //       setError('Failed to fetch data');
  //       console.error('Error fetching data: ', error);
  //     });
  // };

  useEffect(() => {
    GetDerivedData();
    GetUser();
  }, []); // Only run once when the component mounts

  const GetDerivedData = () => {
    const Url = `${BASE_URL}projects/117/things/?page=1&search=&type=gps`;

    // Fetch data from the API
    GETNETWORK(Url, true)
      .then(response => {
        console.log('response.dataresponse.data', response.data.things);
        setLoading(false); // Set loading to false once the data is fetched
        if (response.data && response.data.things) {
          setVehicleData(response.data.things); // Set data dynamically from the API response
        } else {
          setError('No data available');
        }
      })
      .catch(error => {
        setLoading(false);
        setError('Failed to fetch data');
        console.error('Error fetching data: ', error);
      });
  };

  const handleRefresh = async id => {
    // Check if the vehicle is already refreshing to avoid multiple refreshes
    if (refreshFlag[id]) return;

    // Set the flag to true for the specific vehicle to indicate it's refreshing
    setRefreshFlag(prev => ({
      ...prev,
      [id]: true, // Mark vehicle as refreshing
    }));

    try {
      // Call the mapApi for the specific vehicle
      await mapApi(id); // Wait for the API call to complete

      // Update the refresh flag to false once the data is fetched
      setRefreshFlag(prev => ({
        ...prev,
        [id]: false, // Reset flag after refresh is complete
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Reset the flag in case of an error
      setRefreshFlag(prev => ({
        ...prev,
        [id]: false, // Reset refresh flag on error
      }));
    }
  };

  const mapApi = async id => {
    const url = `${BASE_URL}things/datalog/`;

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Extract the date portion

    const payload = {
      from_date: todayDate,
      project: '117',
      thing_id: id,
      to_date: todayDate,
    };

    try {
      const response = await POSTNETWORK(url, payload, true);

      // Log the raw API response data
      console.log('API response:', response);

      if (response?.data?.length > 0) {
        const latestData = response.data[response.data.length - 1];
        const {derived_data, timestamp} = latestData;
        const {
          location,
          speed,
          status,
          today_distance,
          total_distance,
          acceleration,
        } = derived_data;

        // Log the individual derived_data values
        console.log('Derived Data:', derived_data);
        console.log('today_distance:', today_distance);
        console.log('total_distance:', total_distance);
        console.log('location:', location);
        console.log('speed:', speed);
        console.log('status:', status);
        console.log('acceleration:', acceleration);

        // Handle potential NaN for today_distance
        const currentDistance = isNaN(today_distance) ? 0 : today_distance;

        const vehicleDetails = {
          location: {latitude: location[0], longitude: location[1]},
          speed,
          status,
          current_distance: currentDistance, // Ensure it's valid
          total_distance,
          generated_datetime: timestamp,
          acceleration,
        };

        // Log the updated vehicle details
        console.log('Updated vehicle details:', vehicleDetails);

        // Update the selected value
        setSelectedValue(vehicleDetails);

        // Update the vehicle data
        setVehicleData(prevData =>
          prevData.map(item =>
            item.thing_id === id
              ? {...item, derived_live_config: vehicleDetails}
              : item,
          ),
        );
      } else {
        console.log('No data available for the selected date.');
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const connectWebSocket = thingid => {
    const WEBSOCKET_URL = `${ws_baseurl}/thing/r/${thingid}/`;
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
    } catch (error) {
      console.error('Error processing onMessage:', error);
    }
  };

  // WebSocket close event handler
  const onClose = event => {
    console.log('WebSocket closed:', event.code, event.reason);
  };

  // WebSocket error event handler
  const onError = event => {
    console.error('WebSocket error:', event.message);
  };

  const GetUser = async () => {
    const url = `${BASE_URL}user/profile/`;

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
                item.derived_live_config.status === 'STOPPED'
                  ? '#DC3545'
                  : item.derived_live_config.status === 'RUNNING'
                  ? '#28A745'
                  : item.derived_live_config.status === 'IDLE'
                  ? '#FFC107'
                  : item.derived_live_config.status === 'OVERSPEED'
                  ? '#FD7E14'
                  : item.derived_live_config.status === 'UNREACHABLE'
                  ? '#6C757D'
                  : '#007BFF' // Default color for 'ALL' or unknown statuses
              }
              size={30}
              style={{...styles.icon}}
            />

            <View>
              <Text style={{...styles.cardTitle}}>{item.thing_name}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  alignItems: 'center',
                  borderRadius: 5,
                  paddingHorizontal: 5,
                  paddingVertical: 3,
                  marginHorizontal: 10,
                }}
                onPress={() => {
                  handleRefresh(item.thing_id);
                  GetSelectedVehicle(item.thing_id);
                  connectWebSocket(item.thing_id);
                  mapApi(item.thing_id);
                  SetLog(item.thing_id);
                  setHistory(true);
                }}>
                <Icon
                  name="sync" // Use "sync" for the rotate icon in FontAwesome5
                  color="white"
                  size={23}
                />
              </TouchableOpacity>
            </View>

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
            {/* {item.derived_live_config.status} */}
            {refreshFlag[item.thing_id]
              ? 'Refreshing...'
              : item.derived_live_config.status}
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
            {/* {item?.derived_live_config?.acceleration?.toFixed(2)} m/s² */}
            {/* {selectedValue?.acceleration?.toFixed(2) ?? 'N/A'} m/s² */}
            {refreshFlag[item.thing_id]
              ? 'N/A'
              : item?.derived_live_config?.acceleration?.toFixed(2) ??
                'N/A'}{' '}
            m/s²
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
          {/* {item.derived_live_config.total_distance?.toFixed(2) / 1000} km */}
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
            {/* {item.derived_live_config.current_distance?.toFixed(2) / 1000} km */}
            {/* {selectedValue?.current_distance
              ? (selectedValue?.current_distance / 1000).toFixed(2)
              : 'N/A'}{' '}
            km */}
            {refreshFlag[item.thing_id]
              ? 'Refreshing...' // Show "Refreshing..." during refresh
              : (item.derived_live_config.today_distance / 1000).toFixed(2) +
                ' km'}
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
          <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            scrollEnabled={true}>
            <View style={{flex: 1, alignItems: 'center', width: '100%'}}>
              <View
                style={{
                  height: HEIGHT * 0.5,
                }}>
                <TripDetailsGrid data={data} />
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
                    />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
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
                      {selectedValue?.total_distance
                        ? (selectedValue.total_distance / 1000).toFixed(2)
                        : 'N/A'}{' '}
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
                      {selectedValue?.current_distance
                        ? (selectedValue?.current_distance / 1000).toFixed(2)
                        : 'N/A'}{' '}
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
          vehicleData={vehicleDat}
          log={Log}
        />
      </LinearGradient>
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
    width: WIDTH * 0.93,
    height: HEIGHT * 0.39,
    alignSelf: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 10,
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
    // marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  modalCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
