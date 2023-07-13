import React, {useState, useRef, useCallback, useEffect} from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from "react-native";
import {Box, HStack, VStack, Text} from 'native-base';

import RemixIcon from 'react-native-remix-icon';
import {
    driverOrderInfo,
    driverOrderPage,
} from "../com/evotech/common/http/BizHttpUtil";

import {OrderStateEnum} from "../com/evotech/common/constant/BizEnums";

import {showToast} from "../com/evotech/common/alert/toastHelper";


const styles1 = StyleSheet.create({
    buttonStyle: {
        backgroundColor: 'white',
        borderRadius: 0,
        padding: 10,
    },
    textStyle: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const OrderBox = React.memo(({order, navigation, openSheet}) => {
    const {
        userOrderId,
        driverOrderId,
        distance,
        orderState,
        passengersNumber,
        plannedDepartureTime,
        actualDepartureTime,
        departureAddress,
        destinationAddress,
        expectedEarnings,
        totalEarnings,
        departureLatitude,
        departureLongitude,
        destinationLatitude,
        destinationLongitude,
        showTotalEarnings = (orderState === OrderStateEnum.DELIVERED || orderState === OrderStateEnum.COMPLETED),
        cancelButtonShow = (orderState === OrderStateEnum.PENDING || orderState === OrderStateEnum.AWAITING)
    } = order;
    const statusColors = {
        'Pending': '#CCCC00',
        'Awaiting': '#0099FF',
        'Cancelled': '#FF0000',
        'Delivered': '#00CC00',
        'InTransit': '#FF9900',
    };

    const handlePress = () => {
        const queryParam = {
            driverOrderId: driverOrderId,
            userOrderId: userOrderId
        }
            driverOrderInfo(queryParam)
            .then(data => {
                if (data.code === 200) {
                    navigation.navigate('DriverAcceptDetails', {
                        screen: 'DriverAcceptDetailScreen',
                        params: {
                            userOrderId: userOrderId,
                            orderDetailInfo: data.data,
                            Departure: departureAddress,
                            Destination: destinationAddress,
                            DepartureCoords: {
                                "lat": departureLatitude,
                                "lng": departureLongitude
                            },
                            DestinationCoords: {
                                "lat": destinationLatitude,
                                "lng": destinationLongitude
                            },
                            Time: actualDepartureTime ? actualDepartureTime : plannedDepartureTime,
                            Price: showTotalEarnings ? totalEarnings : expectedEarnings,
                            Status: orderState,
                            // 需要添加其他参数，看OrderDetailScreen需要什么参数
                        },
                    });
                } else {
                    showToast('WARNING', 'Warning', data.message)
                }
            }).catch(error => {
            console.error("order info query failed " , error);
            showToast('WARNING', 'Order info query failed', error)
        });
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Box bg="white" shadow={2} rounded="lg" p={4} my={2}>
                <Text color={statusColors[orderState]} alignSelf='flex-end'>{orderState}</Text>
                <VStack space={4}>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" style={{marginTop: 5}}/>
                        <Text>{departureAddress}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" style={{marginTop: 5}}/>
                        <Text>{destinationAddress}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="time-fill" size={15} color="black"/>
                        <Text>{actualDepartureTime ? actualDepartureTime : plannedDepartureTime} · {passengersNumber} {passengersNumber > 1 ? "Passengers" : "Passenger"}</Text>
                    </HStack>
                </VStack>
            </Box>
        </TouchableOpacity>
    );
});

const pageSize = 5;

const DriverAcceptListScreen = ({navigation}) => {
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const refRBSheet = useRef();

    const [hasMore, setHasMore] = useState(true);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         handleRefresh();
    //     }, [])
    // );

    useEffect(() => {
        handleRefresh();  // 在这里运行 handleRefresh 以在组件初始化时获取数据
    }, []);

    const openSheet = useCallback((orderId) => {
        setCancelOrderId(orderId);
        refRBSheet.current.open();
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        const orderList = await queryOrderList(5, 0);  // 5表示首次加载的项数
        setOrders(orderList.content);
        setPage(1);  // 设置为第一页
        setHasMore(true);
        setRefreshing(false);
    }, []);



    const queryOrderList = async (pageSize, page) => {
        const queryOrderListParam = {
            pageSize: pageSize,
            page: page,
        };
        return driverOrderPage(queryOrderListParam)
            .then(data => {
                if (data.code === 200) {
                    return data.data;
                } else {
                    console.log(data.message);
                    return [];
                }
            }).catch(error => {
                console.log(error);
                return [];
            })
    };

    const fetchMoreOrders = useCallback(async () => {
        if (loading || !hasMore) {
            return;
        }
        setLoading(true);
        const orderList = await queryOrderList(pageSize, page);
        if (orderList.content.length > 0) {
            let newOrders = orderList.content.filter(order => {
                // 检查这个订单是否已经在列表中
                for (let i = 0; i < orders.length; i++) {
                    if (orders[i].userOrderId === order.userOrderId) {
                        return false;  // 如果在列表中找到了这个订单，返回false
                    }
                }
                return true;  // 如果在列表中没有找到这个订单，返回true
            });
            setOrders((oldData) => [...oldData, ...newOrders]);
            if(orderList.content.length < pageSize){
                console.log('No more data');
                showToast('SUCCESS', 'Order list is completely', 'There are no more data')
                setHasMore(false); // 设置hasMore为false
            }
        } else {
            console.log('No more data');
            showToast('SUCCESS', 'Order list is completely', 'There are no more data')
            setHasMore(false); // 设置hasMore为false
        }
        setPage((prevPage) => prevPage + 1);
        setLoading(false);
    }, [loading, page, pageSize, orders]);


    const renderItem = useCallback(({item}) => <OrderBox key={item.id} order={item} navigation={navigation}
                                                         openSheet={openSheet}/>, [navigation, openSheet]);

    return (
      <SafeAreaView style={{flex: 1}}>
            <FlatList
                contentContainerStyle={styles.container}
                data={orders}
                renderItem={renderItem}
                onEndReached={fetchMoreOrders}
                onEndReachedThreshold={0.1}
                windowSize={20}
                initialNumToRender={5}
                maxToRenderPerBatch={20}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                ListHeaderComponent={
                    <Box bg="white" shadow={2} rounded="lg" p={4} my={2} style={{marginTop: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>Order List</Text>
                        <Text>This page displays a list of all orders with their status.</Text>
                    </Box>
                }
                ListFooterComponent={<Box height={20}/>}
                keyExtractor={(item, index) => index.toString()}
            />
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
    },
});
export default DriverAcceptListScreen;
