import React, {useState, useEffect, useRef} from 'react';
import {NativeBaseProvider, Box, VStack, HStack, Button, Text, Avatar, Input, Image} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import {
    View,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Linking,
    TouchableWithoutFeedback,
    Platform,
    Animated,
    Keyboard
} from 'react-native';
import {StyleSheet} from 'react-native';
import Geocoder from 'react-native-geocoding';
import RemixIcon from 'react-native-remix-icon';
import {
    driverCancelOrder,
    driverGetPasserCode, driverOrderCompleted,
    driverOrderInfo, driverOrderStart, driverReviewOrder, queryDriverOrderStatus
} from "../com/evotech/common/http/BizHttpUtil";
import {OrderStateEnum} from "../com/evotech/common/constant/BizEnums";
import {Rating} from 'react-native-ratings';
import RBSheet from "react-native-raw-bottom-sheet";
import {format} from "date-fns";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import {closeWebsocket} from "../com/evotech/common/websocket/SingletonWebSocketClient";
import {driverCancelSubscribe} from "../com/evotech/common/websocket/UserChatWebsocket";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";


Geocoder.init('AIzaSyCTgmg64j-V2pGH2w6IgdLIofaafqWRwzc');


const DriverAcceptDetailScreen = ({route, navigation}) => {
    const {
        Departure,
        Destination,
        Time,
        Price,
        Status,
        orderDetailInfo,
        userOrderId,
        DepartureCoords,
        DestinationCoords
    } = route.params;
    const [existDriverInfo, setExistDriverInfo] = useState(false);
    const [rating, setRating] = useState(2);

    const refRBSheet = useRef();  // 引用RBSheet

    const cancelReasonRef = useRef('');
    const reviewRef = useRef('');
    const refRBSheetPayment = useRef();  // 引用RBSheet for PaymentInfoBox
    const refRBSheetReview = useRef();  // 引用RBSheet for ReviewBox

    const handleCancel = () => {
        refRBSheet.current.open();
    };

    const handleConfirmCancel = () => {
        const cancelOrderParam = {
            driverOrderId: orderDetailInfo.driverOrderId,
            userOrderId: userOrderId,
            cancelReason: cancelReasonRef.current.trim() === "" ? 'No Reason' : cancelReasonRef.current,
            cancelDateTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        }
        driverCancelOrder(cancelOrderParam)
            .then(data => {
                if (data.code === 200) {
                    showToast('SUCCESS', 'Success', "Order successfully cancelled");
                    driverCancelSubscribe().then();
                    navigation.goBack(); // After canceling the order, return to the previous screen.
                } else {
                    console.log(data.message);
                    showDialog('WARNING', 'Warning', "Order cancellation failed, Please try again later!");
                }
            }).catch(error => {
            console.log(error);
            showDialog('ERROR', 'Error', "System error: " + error.message);
        });
        refRBSheet.current.close();
    };

    const startChat = (userOrderId) => {
        console.log(userOrderId)
        const params = {
            orderId: userOrderId,
        }
        driverGetPasserCode(params)
            .then(data => {
                if (data.code !== 200) {
                    showDialog('WARNING', 'Warning', data.message);
                    return;
                }
                navigation.navigate('ChatRoom', {
                    receiverName: data.data.userName,
                    receiverUserCode: data.data.userCode,
                    orderStatus: Status,
                });
            }).catch(err => {
            console.error(err.message);
            showDialog('ERROR', 'Error', "Failed to get user info, please try again later!");
        });
    }

    const driverOrderStatusCallBack = () => {
        setTimeout(() => {
            queryDriverOrderStatus().then(data => {
                if (data.code === 200) {
                    const orderStatus = data.data;
                    if (!(orderStatus.pending || orderStatus.inTransit)) {
                        closeWebsocket();
                    }
                }
            })
        }, 0);
    };
    // 更新页面数据
    const fetchDataAndUpdateParams = () => {
        const queryParam = {
            driverOrderId: orderDetailInfo.driverOrderId,
            userOrderId: userOrderId
        }
        driverOrderInfo(queryParam)
            .then(data => {
                if (data.code === 200) {
                    navigation.setParams({
                        Departure: Departure,
                        Destination: Destination,
                        Time: data.data.actualDepartureTime,
                        Price: Price,
                        Status: data.data.orderState,
                        orderDetailInfo: data.data,
                        userOrderId: userOrderId,
                        DepartureCoords: DepartureCoords,
                        DestinationCoords: DestinationCoords
                    });
                } else {
                    showDialog('WARNING', 'Warning', data.message);
                }
            });
    }

    const updateTravelStatus = async (timePropertyName, apiFunction) => {
        try {
            const param = {
                driverOrderId: orderDetailInfo.driverOrderId,
                userOrderId: orderDetailInfo.userOrderId,
                [timePropertyName]: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            };
            apiFunction(param).then(data => {
                if (data.code === 200) {
                    fetchDataAndUpdateParams();

                    // 判断 是否需要关闭websocket
                    driverOrderStatusCallBack();
                } else {
                    showDialog('WARNING', 'Warning', data.message);
                }
            });
        } catch (error) {
            showDialog('ERROR', 'Error', 'Request failed, please try again later.');
            console.error(error);
        }
    };

    const handleOpenMaps = async (address) => {
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${address}`,
            android: `geo:0,0?q=${address}`,
        });
        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
            } else {
                // 如果用户的设备上没有导航应用，则抛出错误
                showDialog('ERROR', 'Error', "Sorry, no navigation application found on your device");
            }
        } catch (error) {
            // 如果其他错误发生，抛出错误
            console.error('An error occurred', error);
            showToast('ERROR', 'Error', "Unable to open navigation, an error occurred");
        }
    };


    useEffect(() => {
        setExistDriverInfo(orderDetailInfo.driverOrderId !== '');
    }, []);


    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        map: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height * 0.51, // 让地图占据40%的屏幕
        },
        box: {
            padding: 5,
            marginTop: 10,
        },
        driverInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        fullScreen: {
            height: Dimensions.get('window').height * 0.49, // 让box占据60%的屏幕
        },
        licensePlateText: {
            fontSize: 20, // 1.5 times the usual size, adjust as needed
            fontWeight: 'bold',
            alignSelf: 'flex-start',
            right: -93,
        },
    });

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

    const reviewOrder = (rating, review) => {
        const param = {
            orderId: orderDetailInfo.driverOrderId,
            reviewContent: review,
            satisfaction: rating,
            reviewTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        }
        driverReviewOrder(param).then(data => {
            console.log(data)
            if (data.code !== 200) {
                showDialog('WARNING', 'Warning', "Failed to submit review, please try again later!");
            } else {
                fetchDataAndUpdateParams();
            }
        }).catch(err => {
            console.error(err.message);
            showDialog('ERROR', 'Error', "Failed to submit review, please try again later!");
        });
    }
    const ReviewBox = () => (
        <InfoBox>
            <VStack space={4} alignItems="stretch">
                <Rating
                    type='star'
                    ratingCount={5}
                    imageSize={40}
                    // fractions={1}
                    startingValue={5}
                    onFinishRating={(rating) => console.log('Rating is ' + rating)}
                />
                <Input
                    placeholder="Write your review here..."
                    onChangeText={value => reviewRef.current = value}
                />
                <Button
                    onPress={() => {
                        Keyboard.dismiss();
                        reviewOrder(rating, reviewRef.current)
                    }}
                >
                    Submit
                </Button>
            </VStack>
        </InfoBox>
    );

    const InfoBox = ({status, children}) => (
        <VStack>
            {status && (
                <Box bg={status.color} p={2} width="100%">
                    <Text>Status: {status.text}</Text>
                </Box>
            )}
            <Box bg="white" shadow={2} p={4}>
                <VStack space={4} mt={1}>
                    {children}
                </VStack>
            </Box>
        </VStack>
    );
    const OrderInfoBox = () => {
        let statusColor;
        switch (Status) {
            case OrderStateEnum.AWAITING:
                statusColor = '#0000FF'; // blue
                break;
            case OrderStateEnum.PENDING:
                statusColor = '#FFFF00'; // yellow
                break;
            case OrderStateEnum.IN_TRANSIT:
                statusColor = '#008000'; // green
                break;
            case OrderStateEnum.DELIVERED:
                statusColor = '#800080'; // purple
                break;
            case OrderStateEnum.CANCELLED:
                statusColor = '#808080'; // gray
                break;
            default:
                statusColor = '#808080'; // default to gray
        }

        const actionSheet = useRef();

        const [animatePress, setAnimatePress] = useState(new Animated.Value(1))

        const animateIn = () => {
            Animated.timing(animatePress, {
                toValue: 0.5,
                duration: 500,
                useNativeDriver: true // Add This line
            }).start();
        }
        const showActionSheet = () => {
            actionSheet.current.show();
        };

        const handleActionSheetPress = (index) => {
            switch (index) {
                case 0:
                    handleOpenMaps(Departure);
                    break;
                case 1:
                    handleOpenMaps(Destination);
                    break;
                default:
                    break;
            }
        };

        return (
            <InfoBox status={{color: statusColor, text: Status}}>
                <VStack space={3}>
                    {Status !== OrderStateEnum.CANCELLED && Status !== OrderStateEnum.COMPLETED && Status !== OrderStateEnum.DELIVERED && (
                        <View style={{position: 'relative'}}>
                            {(Status === OrderStateEnum.PENDING) && (
                                <View>
                                    <Text>Arrive Before <Text fontWeight="bold" color="#0000FF">{Time} </Text>For
                                        Pickup.</Text>
                                    <TouchableOpacity onPress={handleCancel} style={{alignSelf: 'flex-start'}}>
                                        <Text fontSize="sm" style={{fontWeight: 'bold'}}>CANCEL?</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(Status === OrderStateEnum.IN_TRANSIT) && (
                                <View>
                                    <Text>Focus On Driving, Enjoy Your Journey.</Text>
                                    <TouchableOpacity onPress={() => Linking.openURL('tel:999')}
                                                      style={{alignSelf: 'flex-start'}}>
                                        <Text fontSize="sm" style={{fontWeight: 'bold'}}>Emergency Call</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <RBSheet
                                ref={refRBSheet}
                                height={200}
                                closeOnDragDown={true}
                                closeOnPressMask={false}
                                customStyles={{
                                    wrapper: {
                                        backgroundColor: "transparent"
                                    },
                                    draggableIcon: {
                                        backgroundColor: "#000"
                                    }
                                }}
                            >
                                <View style={styles.container}>
                                    <View style={{padding: 10}}>
                                        <Text style={{fontSize: 18, marginBottom: 10}}>Do you want to cancel the
                                            order?</Text>
                                        <Input
                                            mt={4}  // Add margin to the top
                                            mb={4}  // Add margin to the bottom
                                            placeholder="Reason for cancellation (OPTIONAL)"
                                            onChangeText={text => cancelReasonRef.current = text}// onEndEditing={text => setCancelReason(text)}
                                        />

                                        <Button onPress={handleConfirmCancel}>
                                            <Text style={styles1.textStyle}>Confirm Cancel</Text>
                                        </Button>
                                    </View>
                                </View>
                            </RBSheet>
                            <TouchableWithoutFeedback onPress={showActionSheet}>
                                <Image
                                    source={require('../picture/navigation.png')}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: 20,
                                        height: 20,
                                    }}
                                    alt="Navigation icon"
                                />
                            </TouchableWithoutFeedback>
                            <ActionSheet
                                ref={actionSheet}
                                options={['Departure', 'Destination', 'Cancel']}
                                cancelButtonIndex={2}
                                onPress={handleActionSheetPress}
                            />
                        </View>
                    )}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View>
                            <Text fontSize="sm">
                                {orderDetailInfo.passengersNumber} {orderDetailInfo.passengersNumber > 1 ? "Passengers" : "Passenger"} · {orderDetailInfo.paymentType}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => refRBSheetPayment.current.open()}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text fontSize="xl" fontWeight="bold">RM {Price}</Text>
                                <Text fontSize="xs"> {'>'} </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {Status !== OrderStateEnum.CANCELLED && Status !== OrderStateEnum.COMPLETED && (
                        <HStack justifyContent='space-between' alignItems='center' px={0}>
                            <HStack space={4} alignItems='center'>
                                <Avatar
                                    size="md"
                                    source={{
                                        uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWgelHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
                                    }}
                                />
                                <VStack>
                                    <Text fontWeight="bold">Ramalaan bin Abdur Rasheed</Text>
                                    <Text>I need a man driver</Text>
                                </VStack>
                            </HStack>
                            <HStack alignItems='center' space={4}>
                                <TouchableOpacity onPress={() => {
                                    console.log('Phone icon was pressed!');
                                    let phoneNumber = userPhone;
                                    console.log("phone" + phoneNumber)
                                    if (Platform.OS !== 'android') {
                                        phoneNumber = `prompt:${phoneNumber}`;
                                    } else  {
                                        phoneNumber = `tel:${phoneNumber}`;
                                    }
                                    Linking.openURL(phoneNumber);
                                }}>
                                    <View style={{
                                        borderWidth: 1,
                                        borderColor: 'black',
                                        borderRadius: 50,
                                        padding: 5,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <RemixIcon name="phone-line" size={20} color="black"/>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    startChat(userOrderId);
                                }}>
                                    <View style={{
                                        borderWidth: 1,
                                        borderColor: 'black',
                                        borderRadius: 50,
                                        padding: 5,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <RemixIcon name="message-3-line" size={20} color="black"/>
                                    </View>
                                </TouchableOpacity>
                            </HStack>
                        </HStack>
                    )}

                    <HStack space={2} alignItems="flex-start" style={{flexWrap: 'wrap'}}>
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" style={{marginTop: 5}}/>
                        <Text style={{flex: 1}}>{Departure}</Text>
                    </HStack>
                    <HStack space={2} alignItems="flex-start" style={{flexWrap: 'wrap'}}>
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" style={{marginTop: 5}}/>
                        <Text style={{flex: 1}}>{Destination}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="time-fill" size={15} color="black"/>
                        <Text>Time: {Time}</Text>
                    </HStack>
                    {Status === OrderStateEnum.DELIVERED ? (
                        <Button
                            bg="#f0f0f0"
                            onPress={() => refRBSheetReview.current.open()}
                            variant="ghost"
                            style={{height: 40, justifyContent: 'center', flex: 1}}
                        >
                            <HStack space={2}>
                                <RemixIcon name="star-line" size={24} color="black"/>
                                <Text>Rate</Text>
                            </HStack>
                        </Button>
                    ) : null}
                </VStack>
            </InfoBox>
        );
    };

    const PaymentInfoBox = () => (
        <InfoBox title="Payment Information">
            <VStack space={4} alignItems="stretch">
                <HStack>
                    <Text>Order No: {orderDetailInfo.driverOrderId}</Text>
                </HStack>
                <HStack>
                    <Text>Earnings: {orderDetailInfo.totalEarnings}</Text>
                </HStack>
                <HStack>
                    <Text>Settlement Status: {orderDetailInfo.settlementStatus}</Text>
                </HStack>
                {(orderDetailInfo.settlementFailureReason !== '') && <HStack>
                    <Text>Settlement Status: {orderDetailInfo.settlementFailureReason}</Text>
                </HStack>}
            </VStack>
        </InfoBox>
    );

    // const DriverInfoBox = ({showBack, status}) => (
    //     <InfoBox title="Driver Information" showBack={showBack}>
    //         <VStack space={4} alignItems="stretch">
    //             <HStack justifyContent='space-between' alignItems='center'>
    //                 <VStack>
    //                     <Avatar
    //                         size="lg"
    //                         source={{
    //                             uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    //                         }}
    //                     />
    //                     <Text>Ramalaan bin Abdur Rasheed</Text>
    //                 </VStack>
    //                 <View style={{alignItems: 'flex-end'}}>
    //                     <Text style={{...styles.licensePlateText, lineHeight: 30}}>UKM 6869</Text>
    //                     <Text>GRAY - PROTON SAGA (GRAY)</Text>
    //                 </View>
    //             </HStack>
    //             {status !== OrderStateEnum.DELIVERED ? (
    //                 <HStack space={2}>
    //                     <Button
    //                         bg="#f0f0f0"
    //                         onPress={() => console.log('Chat with Driver')}
    //                         variant="ghost"
    //                         style={{height: 40, justifyContent: 'center', flex: 8}} // 添加自定义样式
    //                     >
    //                         <HStack space={2}>
    //                             <RemixIcon name="message-3-line" size={24} color="black"/>
    //                             <Text>Chat</Text>
    //                         </HStack>
    //                     </Button>
    //                     <Button
    //                         bg="#e0e0e0"
    //                         onPress={() => console.log('Call Driver')}
    //                         variant="ghost"
    //                         style={{height: 40, justifyContent: 'center', flex: 2}} // 添加自定义样式
    //                     >
    //                         <HStack space={2}>
    //                             <RemixIcon name="phone-line" size={24} color="black"/>
    //                         </HStack>
    //                     </Button>
    //                 </HStack>
    //             ) : (
    //                 <Button
    //                     bg="#f0f0f0"
    //                     onPress={() => refRBSheetReview.current.open()}
    //                     variant="ghost"
    //                     style={{height: 40, justifyContent: 'center', flex: 1}}
    //                 >
    //                     <HStack space={2}>
    //                         <RemixIcon name="star-line" size={24} color="black"/>
    //                         <Text>Rate</Text>
    //                     </HStack>
    //                 </Button>
    //             )}
    //         </VStack>
    //     </InfoBox>
    // );


    const MapComponent = () => (
        <>
            <MapView
                style={styles.map}
                region={{
                    latitude: (DepartureCoords.lat + DestinationCoords.lat) / 2,
                    longitude: (DepartureCoords.lng + DestinationCoords.lng) / 2,
                    latitudeDelta: Math.abs(DepartureCoords.lat - DestinationCoords.lat) * 2 * 0.7,
                    longitudeDelta: Math.abs(DepartureCoords.lng - DestinationCoords.lng) * 2 * 0.7,
                }}
            >
                <Marker pinColor="blue" coordinate={{latitude: DepartureCoords.lat, longitude: DepartureCoords.lng}}/>
                <Marker coordinate={{latitude: DestinationCoords.lat, longitude: DestinationCoords.lng}}/>
            </MapView>
        </>
    );
    const renderContentBasedOnStatus = () => {
        switch (Status) {
            //待出行
            case OrderStateEnum.PENDING:
                return (
                    <ScrollView style={styles.fullScreen}>
                        {DepartureCoords && DestinationCoords && <MapComponent/>}
                        <OrderInfoBox showStatus={true}/>
                        <RBSheet
                            ref={refRBSheetPayment}
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            height={Dimensions.get('window').height * 0.184} // 设置RBSheet占据50%的屏幕高度
                        >
                            <PaymentInfoBox/>
                        </RBSheet>
                    </ScrollView>
                );
            //旅途中
            case OrderStateEnum.IN_TRANSIT:
                return (
                    <>
                        {DepartureCoords && DestinationCoords && (
                            <ScrollView style={styles.fullScreen}>
                                <MapComponent/>
                                <OrderInfoBox showStatus={false}/>
                                <RBSheet
                                    ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                                    closeOnDragDown={true}
                                    closeOnPressMask={true}
                                    height={Dimensions.get('window').height * 0.184}
                                >
                                    <PaymentInfoBox/>
                                </RBSheet>
                            </ScrollView>
                        )}
                    </>
                );
            // 已送达
            case OrderStateEnum.DELIVERED:
                return (
                    <ScrollView style={styles.fullScreen}>
                        <OrderInfoBox showStatus={true}/>
                        <RBSheet
                            ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            height={Dimensions.get('window').height * 0.184}
                        >
                            <PaymentInfoBox/>
                        </RBSheet>
                        <RBSheet
                            ref={refRBSheetReview} // 添加了一个新的RBSheet
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            height={Dimensions.get('window').height * 0.28}
                        >
                            <ReviewBox/>
                        </RBSheet>
                    </ScrollView>
                );

            //已取消
            case OrderStateEnum.CANCELLED:
                return (
                    <ScrollView style={styles.fullScreen}>
                        <OrderInfoBox showStatus={true}/>
                        <RBSheet
                            ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            height={Dimensions.get('window').height * 0.184}
                        >
                            <PaymentInfoBox/>
                        </RBSheet>
                    </ScrollView>
                );

            //已完成
            case OrderStateEnum.COMPLETED:
                return (
                    <ScrollView style={styles.fullScreen}>
                        <OrderInfoBox showStatus={true} status={Status}/>
                        {/*{existDriverInfo && <DriverInfoBox showBack={existDriverInfo}/>}*/}
                        <RBSheet
                            ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            height={Dimensions.get('window').height * 0.184}
                        >
                            <PaymentInfoBox/>
                        </RBSheet>
                    </ScrollView>
                );
            default:
                return null;
        }
    };
    return (
        <NativeBaseProvider>
            <View style={styles.container}>
                {renderContentBasedOnStatus()}
                {
                    Status === OrderStateEnum.PENDING &&
                    <Button
                        onPress={() => updateTravelStatus('departureTime', driverOrderStart)}
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            marginTop: 20,
                            marginBottom: 20,
                            backgroundColor: '#0000FF'
                        }}
                    >
                        Arrived at the passenger starting point
                    </Button>
                }
                {
                    Status === OrderStateEnum.IN_TRANSIT &&
                    <Button
                        onPress={() => updateTravelStatus('actualArrivalTime', driverOrderCompleted)}
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            marginTop: 20,
                            marginBottom: 20,
                            backgroundColor: '#0000FF'
                        }}
                    >
                        Order completed
                    </Button>
                }
            </View>
        </NativeBaseProvider>
    );
};
export default DriverAcceptDetailScreen;
