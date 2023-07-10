import { NativeBaseProvider, Box, VStack, HStack, Button, Text } from 'native-base';
import MapView, {Marker, Polyline} from 'react-native-maps';
import { View, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';
import RemixIcon from "react-native-remix-icon";
import React from "react";

const OrderDetailScreen = ({ route, navigation }) => {
    console.log(route.params);
    const { departure, destination, date, passengerCount, pickupWaiting, coords, departureCoords, destinationCoords } = route.params;
    const dateObj = new Date(date); // 将字符串转换回 Date 对象

    const mapHeightPercentage = 0.7;  // 地图组件高度比例
    const boxHeightPercentage = 1 - mapHeightPercentage;  // Box组件高度比例

    const handleBack = () => {
        navigation.navigate('Activity');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        map: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
        },
    });

    const formatDate = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

        const dateString = date.toLocaleDateString('en-GB', options); // formats to day/month/year
        const timeString = date.toLocaleTimeString('en-US', timeOptions); // formats to hour:minute AM/PM

        return `${dateString} ${timeString}`;
    };

    const minLatitude = Math.min(...coords.map(c => c.latitude));
    const maxLatitude = Math.max(...coords.map(c => c.latitude));
    const minLongitude = Math.min(...coords.map(c => c.longitude));
    const maxLongitude = Math.max(...coords.map(c => c.longitude));
    const centerLatitude = (minLatitude + maxLatitude) / 2;
    const centerLongitude = (minLongitude + maxLongitude) / 2;
    const padding = 1.8; // 你可以调整这个值
    const latitudeDelta = (maxLatitude - minLatitude) * padding;
    const longitudeDelta = (maxLongitude - minLongitude) * padding;

    return (
        <NativeBaseProvider>
            <View style={styles.container}>
                <MapView
                    style={{ ...styles.map, marginBottom: Dimensions.get('window').height * boxHeightPercentage }}
                    initialRegion={{
                        latitude: centerLatitude,
                        longitude: centerLongitude,
                        latitudeDelta,
                        longitudeDelta,
                    }}
                >
                    <Polyline
                        coordinates={coords}
                        strokeWidth={4}
                        strokeColor="red"
                    />
                    {departureCoords && (  // 判断是否有出发地坐标
                        <Marker
                            coordinate={departureCoords}  // 设置标记的位置
                            title="Departure"  // 设置标记的标题（当用户点击标记时显示）
                            pinColor="blue"  // 设置标记的颜色为蓝色
                        />
                    )}
                    {destinationCoords && (  // 判断是否有目的地坐标
                        <Marker
                            coordinate={destinationCoords}  // 设置标记的位置
                            title="Destination"  // 设置标记的标题（当用户点击标记时显示）
                        />
                    )}
                </MapView>
                <Box
                    bg="white"
                    p={4}
                    w="100%"
                    h={Dimensions.get('window').height * boxHeightPercentage}
                    position="absolute"
                    bottom={0}
                    borderTopRadius={10}
                >
                    <VStack space={4} alignItems="stretch">
                        <HStack space={2} alignItems="center">
                            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" style={{marginTop: 5}}/>
                            <Text>{departure}</Text>
                        </HStack>
                        <HStack space={2} alignItems="center">
                            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" style={{marginTop: 5}}/>
                            <Text>{destination}</Text>
                        </HStack>
                        <HStack space={2} alignItems="center">
                            <RemixIcon name="time-fill" size={15} color="black"/>
                            <Text>{dateObj ? formatDate(dateObj) : ''} · {passengerCount} Passenger</Text>
                        </HStack>
                        <Button mt={4} onPress={handleBack}>
                            {pickupWaiting}
                        </Button>
                    </VStack>
                </Box>
            </View>
        </NativeBaseProvider>
    );
};

export default OrderDetailScreen;
