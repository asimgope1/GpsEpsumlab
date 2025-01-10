import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import React, { useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import { HEIGHT, WIDTH } from '../../constants/config';
import { BOLD } from '../../constants/fontfamily';
import { RFValue } from 'react-native-responsive-fontsize';

const TripDetailsGrid = () => {
    const statusData = [
        { id: '1', status: 'All', backgroundColor: '#007BFF' }, // Bright Blue
        { id: '2', status: 'Running', backgroundColor: '#28A745' },      // Dark Green
        { id: '3', status: 'Idle', backgroundColor: '#FFC107' },         // Amber
        { id: '4', status: 'Stopped', backgroundColor: '#DC3545' },      // Dark Red
        { id: '5', status: 'Overspeed', backgroundColor: '#FD7E14' },    // Deep Orange
        { id: '6', status: 'Unreachable', backgroundColor: '#6C757D' },  // Gray
    ];


    const [showGoBack, setShowGoBack] = useState(false);
    const flatListRef = useRef(null);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const contentWidth = event.nativeEvent.contentSize.width;
        const layoutWidth = event.nativeEvent.layoutMeasurement.width;

        // Check if the user has reached the end of the list
        if (contentOffsetX + layoutWidth >= contentWidth - 50) {
            setShowGoBack(true);
        } else {
            setShowGoBack(false);
        }
    };

    const scrollToEnd = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const scrollToStart = () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    };

    const renderItem = ({ item }) => (
        <View style={[styles.statusCard, { backgroundColor: item.backgroundColor }]}>
            <Icon name="directions-car" size={35} color="white" />
            <View style={{ marginTop: 0 }}>
                <Text style={styles.statusText}>{item.status}</Text>
                <Text style={styles.statusText1}>0</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.scrollContainer}>
            {!showGoBack && (
                <TouchableOpacity style={styles.scrollHintButton} onPress={scrollToEnd}>
                    <Icon name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            )}
            {showGoBack && (
                <TouchableOpacity style={styles.goBackButton} onPress={scrollToStart}>
                    <Icon name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
            )}

            <FlatList
                data={statusData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                ref={flatListRef}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16} // Smooth scrolling updates
            />
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        height: HEIGHT * 0.2,
        paddingVertical: 16,
    },
    listContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    scrollHintButton: {
        position: 'absolute',
        top: 0,
        right: 20,
        padding: 8,
        backgroundColor: '#4FC3F7',
        borderRadius: 25,
        zIndex: 1,
        elevation: 5,
    },
    goBackButton: {
        position: 'absolute',
        top: 0,
        left: 20,
        padding: 8,
        backgroundColor: '#EF5350',
        borderRadius: 25,
        zIndex: 1,
        elevation: 5,
    },
    statusCard: {
        width: WIDTH * 0.25,
        height: HEIGHT * 0.11,
        marginHorizontal: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    statusText: {
        fontSize: 14,
        fontFamily: BOLD,
        // fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    statusText1: {
        fontSize: RFValue(17),
        fontFamily: BOLD,
        // fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
});

export default TripDetailsGrid;
