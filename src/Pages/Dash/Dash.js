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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Avatar, Icon } from '@rneui/themed';
import { LIGHT, REGULAR } from '../../constants/fontfamily';
import { HEIGHT, WIDTH } from '../../constants/config';
import { clearAll } from '../../utils/Storage';
import { checkuserToken } from '../../redux/actions/auth';
import { useDispatch } from 'react-redux';
import { GETNETWORK } from '../../utils/Network';
import { BASE_URL } from '../../constants/url';
import TripDetailsGrid from '../VehicleMap/TripDetailsGrid';
import { BLACK } from '../../constants/color';

const Dash = () => {
    const [vehicleData, setVehicleData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const Dispatch = useDispatch();

    useEffect(() => {
        GetDerivedData();
    }, []); // Only run once when the component mounts

    const GetDerivedData = () => {
        const Url = `${BASE_URL}projects/117/things/?page=1&search=&type=gps`;

        // Fetch data from the API
        GETNETWORK(Url, true)
            .then((response) => {
                console.log(response.data);
                setLoading(false); // Set loading to false once the data is fetched
                if (response.data && response.data.things) {
                    setVehicleData(response.data.things); // Set data dynamically from the API response
                } else {
                    setError('No data available');
                }
            })
            .catch((error) => {
                setLoading(false);
                setError('Failed to fetch data');
                console.error("Error fetching data: ", error);
            });
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

    const renderVehicleCard = ({ item }) => (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.thing_name}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Icon name="directions-bus" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Tour: </Text>
                    <Text>{item.properties.default_properties.tour}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="route" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Route: </Text>
                    <Text>{item.properties.default_properties.route}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="car" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Vehicle No: </Text>
                    <Text>{item.properties.default_properties.vehicle_no}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="speed" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Speed Limit: </Text>
                    <Text>{item.properties.default_properties.speed_limit}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="person" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Driver: </Text>
                    <Text>{item.properties.default_properties.driver_name}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="directions-car" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Type: </Text>
                    <Text>{item.properties.default_properties.vehicle_type}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Icon name="event-note" type="MaterialIcons" color="#316163" size={30} />
                    <Text style={styles.cardLabel}>Next Maintenance: </Text>
                    <Text>{item.properties.default_properties.next_mentainance_date}</Text>
                </View>
            </View>
        </View>
    );


    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#316163" />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#316163' }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEnabled={true}>
                        <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
                            {/* Header Container */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '95%',
                                    paddingVertical: 25,
                                    paddingHorizontal: 10,
                                    backgroundColor: '#316163',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.5,
                                    borderRadius: 8,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Avatar
                                        size="medium"
                                        rounded
                                        source={{
                                            uri: 'https://randomuser.me/api/portraits/men/1.jpg',
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: 15,
                                            marginLeft: 10,
                                        }}
                                    >
                                        Welcome, User Name!
                                        {'\n'}
                                        Last login: 2022-03-15 10:30 AM
                                    </Text>
                                </View>
                                <Icon
                                    onPress={() => {
                                        clearAll();
                                        Dispatch(checkuserToken());
                                    }}
                                    name="notifications"
                                    type="AntDesign"
                                    color="white"
                                    size={25}
                                />
                            </View>

                            <TripDetailsGrid />

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
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.5,
                                    elevation: 5,
                                    flex: 1,
                                }}
                            >
                                {/* Display content */}
                                {loading ? (
                                    renderLoading()
                                ) : error ? (
                                    renderError()
                                ) : (
                                    <FlatList
                                        data={vehicleData}
                                        renderItem={renderVehicleCard}
                                        keyExtractor={(item, index) => index.toString()}
                                        contentContainerStyle={{ width: '100%', paddingHorizontal: 10 }}
                                    />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => {
                        setShowModal(false);
                    }}
                    style={{
                        flex: 1,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(100, 100, 100, 0.5)',
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            width: '100%',
                            alignSelf: 'center',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            backgroundColor: 'rgba(100, 100, 100, 0.9)',
                        }}
                    >
                        {/* Modal Content */}
                    </View>
                </Modal>
            </SafeAreaView>
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
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 10,
        padding: 15,
        width: WIDTH * 0.9,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },

    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,
    },

    cardTitle: {
        fontSize: 18,
        fontFamily: REGULAR,
        color: 'black'

    },

    cardBody: {
        width: '100%',
        paddingVertical: 10,
        alignSelf: 'center',
    },

    cardRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },

    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        width: 120,
    },

    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
    },

    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },

    modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },

    closeButton: {
        backgroundColor: '#316163',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 5,
        alignItems: 'center',
    },

    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Dash;