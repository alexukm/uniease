import React, {useState,useCallback} from 'react';
import {StyleSheet, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import {Box, HStack, VStack, Text} from 'native-base';
import RemixIcon from 'react-native-remix-icon';
import { userOrderInfo, userOrderPage} from "../com/evotech/common/http/BizHttpUtil";
import {OrderStateEnum} from "../com/evotech/common/constant/BizEnums";
import {useFocusEffect} from '@react-navigation/native';
import {formatDate} from "../com/evotech/common/formatDate";
import {showToast} from "../com/evotech/common/alert/toastHelper";

const OrderBox = React.memo(({order, navigation}) => {
    const {
        departureAddress,
        destinationAddress,
        departureTime,
        price,
        orderState,
        orderId,
        departureLatitude,
        departureLongitude,
        destinationLatitude,
        destinationLongitude,
        cancelButtonShow = (OrderStateEnum.AWAITING === orderState || orderState === OrderStateEnum.PENDING)
    } = order;
    // const [cancelButtonShow, setCancelButtonShow] = useState(false);

    // setCancelButtonShow(OrderStateEnum.AWAITING === orderState || orderState === OrderStateEnum.PENDING);
    const statusColors = {
        'Pending': '#CCCC00',
        'Awaiting': '#0099FF',
        'Cancelled': '#FF0000',
        'Delivered': '#00CC00',
        'InTransit': '#FF9900',
    };

    const handlePress = () => {
        const queryParam = {
            orderId: orderId,
        }
        userOrderInfo(queryParam)
            .then(data => {
                if (data.code === 200) {
                    navigation.navigate('SimpleOrderDetails', {
                        screen: 'SimpleOrderDetailScreen',
                        params: {
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
                            Time: departureTime,
                            Price: price,
                            Status: orderState,
                            // 需要添加其他参数，看OrderDetailScreen需要什么参数
                        },
                    });
                } else {
                    showToast('WARNING', 'Warning', data.message);
                }
            }).catch(error => {
            console.log("order info query failed " + error.message);
            showToast('ERROR', 'Error', 'Order details query failed, please try again later!');
        });
    };
    return (
        <TouchableOpacity onPress={handlePress}>
            <Box bg="white" shadow={2} rounded="lg" p={4} my={2}>
                <Text color={statusColors[orderState]} alignSelf='flex-end'>{orderState}</Text>
                <VStack space={4}>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue"/>
                        <Text>{departureAddress}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange"/>
                        <Text>{destinationAddress}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="time-fill" size={15} color="black"/>
                        <Text>
                            {formatDate(new Date(departureTime))} ·
                            <Text style={{fontWeight: 'bold'}}>RM {price}</Text>
                        </Text>
                    </HStack>
                </VStack>
            </Box>
        </TouchableOpacity>
    );
});

const pageSize = 5;

const OrderListScreen = ({navigation}) => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            handleRefresh();
        }, [])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1); // Reset page
        const orderList = await queryOrderList(pageSize, 1); // Query the first page of orders
        setOrders(orderList.content); // Reset the orders list
        setRefreshing(false);
    }, []);

    const queryOrderList = async (pageSize, page) => {
        const queryOrderListParam = {
            pageSize: pageSize,
            page: page,
        };
        return userOrderPage(queryOrderListParam)
            .then(data => {
                if (data.code === 200) {
                    return data.data;
                } else {
                    console.log(data.message);
                    showToast('WARNING', 'Warning', data.message);
                    return [];
                }
            }).catch(error => {
                console.log(error);
                showToast('ERROR', 'Error', 'Error', error);
                return [];
            })
    };

    const fetchMoreOrders = useCallback(async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        const nextPage = page + 1;
        const orderList = await queryOrderList(pageSize, nextPage);
        if (orderList.content.length > 0) {
            setOrders((oldData) => [...oldData, ...orderList.content]);
            setPage(nextPage);
        } else {
            showToast('SUCCESS', 'Order list is completely', 'There are no more data');
        }
        setLoading(false);
    }, [loading, page]);


    const renderItem = useCallback(({item}) => <OrderBox key={item.id} order={item} navigation={navigation}
    />, [navigation]);


    return (
        <>
            <FlatList
                contentContainerStyle={styles.container}
                data={orders}
                renderItem={renderItem}
                onEndReached={fetchMoreOrders}
                onEndReachedThreshold={0}
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
                keyExtractor={item => item.id}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
    },
});

export default OrderListScreen;
