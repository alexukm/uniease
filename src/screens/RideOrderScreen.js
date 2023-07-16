import React, {useState, useEffect, useRef} from 'react';
import {
    Dimensions,
    Image,
    Pressable,
    View,
    Alert,
    ActivityIndicator,
    TouchableOpacity, Platform,
} from "react-native";
import Geolocation from '@react-native-community/geolocation';
import {
    Box,
    Button,
    HStack,
    Input,
    NativeBaseProvider,
    Text,
    VStack,
    Modal,
    Spinner,
    Heading,
    KeyboardAvoidingView,
} from "native-base";
import RemixIcon from 'react-native-remix-icon';
import DatePicker from 'react-native-date-picker';
import Geocoder from 'react-native-geocoding';
import MapView, {Polyline} from 'react-native-maps';
import {Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {
    orderPriceCheck,
    userOrderCheck,
    userSubmitOrder
} from "../com/evotech/common/http/BizHttpUtil";
import {format} from 'date-fns';
import {googleMapsApiKey} from "../com/evotech/common/apiKey/mapsApiKey";
import apiService from "../com/evotech/common/apiKey/apiService";
import {formatDate} from "../com/evotech/common/formatDate";
import {userOrderWebsocket} from "../com/evotech/common/websocket/UserChatWebsocket";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";
import { Toast } from "react-native-alert-notification";
import {locationPermission} from "../com/evotech/permissions/PermissionsSupport";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import { enableSystemNotify } from "../com/evotech/common/notify/SystemNotify";
import PushNotification from "react-native-push-notification";
import alert from "native-base/src/components/composites/Alert/Alert";



// 初始化Geocoder库，这个库用于处理地址和地理坐标的相互转化
Geocoder.init(googleMapsApiKey);

const RideOrderScreen = () => {
    // open, date, passengerCount等都是应用状态，可以在应用中使用和修改
    const [date, setDate] = useState(null);
    const [open, setOpen] = useState(false);
    const [passengerCount, setPassengerCount] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [departure, setDeparture] = useState('');
    const [departureAddress, setDepartureAddress] = useState('');
    const [destination, setDestination] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [remarks, setRemarks] = useState('');

    // 更多的状态，主要与地图、路线和建议的显示有关
    const [isSuccessScreen, setIsSuccessScreen] = useState(false);
    const [pickupWaiting, setPickupWaiting] = useState("Check the Status");

    //save departure location
    const [departureSuggestions, setDepartureSuggestions] = useState([]);
    const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);

    //save destination location
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

    const [isDepartureSelected, setIsDepartureSelected] = useState(false);
    const [isDestinationSelected, setIsDestinationSelected] = useState(false);

    //跳转目的地地图
    // 目的地经纬度
    const [destinationCoords, setDestinationCoords] = useState(null);

    //存储这个坐标数组
    const [coords, setCoords] = useState([]);

    const [estimatedDistance, setEstimatedDistance] = useState(null);
    const [estimatedDistanceOrder, setEstimatedDistanceOrder] = useState(null);
    const [estimatedDuration, setEstimatedDuration] = useState(null);
    const [estimatedDurationOrder, setEstimatedDurationOrder] = useState(null);
    const [orderPrice, setOrderPrice] = useState(null);

    const navigation = useNavigation();

    // 使用React的useRef创建一个引用，可以用它来访问MapView组件
    const mapRef = useRef(null);

    const [departureCoords, setDepartureCoords] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const isLoadingRef = useRef(isLoading);

    //submitOrder函数spinner
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [isDepartureManual, setIsDepartureManual] = useState(false);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);


    // 从Google API获取地址建议
    const updateAddressSuggestions = async (input, setSuggestions) => {
        const predictions = await apiService.getAutocomplete(input);
        setSuggestions(predictions);
    };

    // 分别用于获取出发地和目的地的建议
    const fetchDepartureSuggestions = async (input) => {
        if (!showDepartureSuggestions) {
            const predictions = await apiService.getAutocomplete(input);
            setDepartureSuggestions(predictions);
        }
    };

    const fetchDestinationSuggestions = async (input) => {
        if (!showDestinationSuggestions) {
            const predictions = await apiService.getAutocomplete(input);
            setDestinationSuggestions(predictions);
        }
    };

    //获取经纬度，并将地图焦点移动到新的位置
    const moveToLocation = async (placeId) => {
        try {
            const location = await apiService.getLocationDetails(placeId);
            mapRef.current.animateToRegion({
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta: 0.005,  // smaller value for a more zoomed in view
                longitudeDelta: 0.005,  // smaller value for a more zoomed in view
            }, 1000);
        } catch (error) {
            console.error(error);
        }
    };

    // useEffect在组件渲染后执行，用于在用户输入出发地和目的地时获取地址建议
    useEffect(() => {
        if (!isDepartureSelected && departure.length > 2) {
            fetchDepartureSuggestions(departure).then();
            setShowDepartureSuggestions(true);
        } else {
            setShowDepartureSuggestions(false);
            setDepartureSuggestions([]); // 清空建议列表
        }
    }, [departure]);

    useEffect(() => {
        if (!isDestinationSelected && destination.length > 2) {
            fetchDestinationSuggestions(destination).then();
            setShowDestinationSuggestions(true);
        } else {
            setShowDestinationSuggestions(false);
            setDestinationSuggestions([]); // 清空建议列表
        }
    }, [destination]);


    // const getCurrentLocation = () => {
    //     Geolocation.getCurrentPosition(async info => {
    //         const {latitude, longitude} = info.coords;
    //         // setDeparture(`lat: ${latitude}, lng: ${longitude}`);
    //         setDepartureCoords({latitude: latitude, longitude: longitude});
    //         try {
    //             const response = await Geocoder.from(latitude, longitude);
    //             const address = response.results[0].formatted_address;
    //             setDeparture(address);
    //             const predictions = await apiService.getAutocomplete(address);
    //             if (predictions.length > 0) {
    //                 setDepartureAddress(predictions[predictions.length-1].terms)
    //             }
    //             mapRef.current.animateToRegion({
    //                 latitude,
    //                 longitude,
    //                 latitudeDelta: 0.0922,
    //                 longitudeDelta: 0.0421,
    //             },1000);
    //             // 定位到地图上的经纬度位置
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     });
    // };

    // 这个函数获取当前地理位置，并将地图中心移动到这个位置
    // const getCurrentLocation = () => {
    //     Geolocation.getCurrentPosition(async info => {
    //         const {latitude, longitude} = info.coords;
    //         setDepartureCoords({latitude: latitude, longitude: longitude});
    //         if (!isDepartureManual) { // 如果用户还没有手动输入出发地
    //             try {
    //                 const response = await Geocoder.from(latitude, longitude);
    //                 const address = response.results[0].formatted_address;
    //                 const placeId = response.results[0].place_id; // 获取地点的ID
    //                 setDeparture(address);
    //                 await moveToLocation(placeId); // 使用地点ID移动到当前位置
    //             } catch (error) {
    //                 console.error(error);
    //             }
    //         }
    //     });
    // };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
          async info => {
              // 当成功获取位置时执行此代码块
              const {latitude, longitude} = info.coords;
              setDepartureCoords({latitude: latitude, longitude: longitude});
              mapRef.current.animateToRegion({
                  latitude,
                  longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
              }, 1000); // 马上移动到当前位置
              if (!isDepartureManual) { // 如果用户还没有手动输入出发地
                  try {
                      const response = await Geocoder.from(latitude, longitude);
                      const address = response.results[0].formatted_address;
                      const placeId = response.results[0].place_id; // 获取地点的ID
                      setDeparture(address);
                      await moveToLocation(placeId); // 使用地点ID移动到当前位置
                      const predictions = await apiService.getAutocomplete(address);
                      if (predictions.length > 0) {
                          setDepartureAddress(predictions[predictions.length - 1].terms)
                      }
                  } catch (error) {
                      console.error(error);
                  }
              }
          },
          error => {
              // 当获取位置失败时执行此代码块
              console.error(error);
              showDialog('ERROR', 'Location Error', 'Unable to retrieve current location.');
          }
        );
    };

    // 这个函数请求地理位置权限
    const requestLocationPermission = async () => {
        await locationPermission((result) => {
            getCurrentLocation()
        }, (result) => {
            getCurrentLocation()
        }, (error) => {
            console.warn(error);
            showDialog('WARNING', 'Action Required', 'Location permission denied. For automatic location input, please enable location access.');
        })
        /*   try {
               const granted = await PermissionsAndroid.request(
                   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                   {
                       title: "Location Permission",
                       message: "This app needs access to your location",
                       buttonNeutral: "Ask Me Later",
                       buttonNegative: "Cancel",
                       buttonPositive: "OK"
                   }
               );
               if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                   getCurrentLocation();
               } else {
                   console.log("Location permission denied");
                   showDialog('WARNING', 'Action Required', 'Location permission denied. For automatic location input, please enable location access.');
               }
           } catch (err) {
               console.warn(err);
           }*/
    };

    // 在组件渲染后请求地理位置权限
    useEffect(() => {
        setTimeout(async () => {
            await requestLocationPermission().then();
        }, 0);
    }, []);

    // 这个函数处理打开日期选择器的逻辑
    const handleOpenDatePicker = () => {
        setOpen(true);
    };

    // const navigateHome = () => {
    //     navigation.navigate('Tabs', {screen: 'Home'});
    // };
    const allowOrder = () => {
        userOrderCheck()
            .then(data => {
                if (data.code === 600) {
                    Alert.alert(
                        "WARN!",
                        data.message,
                        [
                            {
                                text: "Cancel", onPress: () => {
                                    console.log("Cancel Pressed");
                                    setIsBookingConfirmed(false);
                                }
                            },
                            {
                                text: "OK", onPress: () => {
                                    console.log("OK Pressed");
                                    handleNextStep();
                                }
                            }
                        ]
                    );
                } else {
                    handleNextStep();
                }
            }).catch(err => {
            console.log("user order check fail" + err.message);
            showDialog('DANGER', 'System error', 'System error,Please try again later!');
            setIsLoading(false);  // 处理失败，停止 spinner
        });
    };

    const closeModal = () => {
        setIsLoading(true);
        setModalVisible(false);
        setIsLoading(false);
    };

    const fillAddress = (addressArray, prefix, orderSubmitParam) => {
        const len = addressArray.length;
        if (len > 0) {
            orderSubmitParam[`${prefix}Country`] = addressArray[len - 1].value;
        }
        if (len > 1) {
            orderSubmitParam[`${prefix}State`] = addressArray[len - 2].value;
        }
        if (len === 3) {
            orderSubmitParam[`${prefix}Address`] = addressArray[len - 3].value;
        } else if (len > 3) {
            orderSubmitParam[`${prefix}City`] = addressArray[len - 3].value;
            let address = "";
            for (let i = len - 4; i >= 0; i--) {
                address += addressArray[i].value + " ";
            }
            orderSubmitParam[`${prefix}Address`] = address;
        }
    };

    const fillDepAddress = (orderSubmitParam) => {
        fillAddress(departureAddress, 'departure', orderSubmitParam);
    };

    const fillDescAddress = (orderSubmitParam) => {
        fillAddress(destinationAddress, 'destination', orderSubmitParam);
    };


    const submitOrder = () => {
        try {
            const orderSubmitParam = {
                'distance': estimatedDistanceOrder,
                'expectedTravelTime': estimatedDurationOrder,
                'plannedDepartureTime': format(date, 'yyyy-MM-dd HH:mm:ss'),
                'travelMode': "Private",
                'passengersNumber': passengerCount,
                'estimatedFare': orderPrice,
                'remark': remarks,
                'paymentType': "Cash",
                'departureCountry': "",
                'departureState': "",
                'departureCity': "",
                'departureAddress': "",
                'destinationCountry': "",
                'destinationState': "",
                'destinationCity': "",
                'destinationAddress': "",
                'departureLatitude': departureCoords.latitude,
                'departureLongitude': departureCoords.longitude,
                'destinationLatitude': destinationCoords.latitude,
                'destinationLongitude': destinationCoords.longitude
            }
            fillDepAddress(orderSubmitParam);
            fillDescAddress(orderSubmitParam);

            setIsSubmitting(true);

            // Get the planned departure time and the current time
            const plannedDepartureTime = new Date(format(date, 'yyyy-MM-dd HH:mm:ss'));
            const currentTime = new Date();

            // Calculate the difference in minutes
            const diffInMinutes = Math.abs(plannedDepartureTime.getTime() - currentTime.getTime()) / 1000 / 60;

            // If the difference is less than 10 minutes
            if (diffInMinutes < 10) {
                // Trigger the alert
                Alert.alert(
                  'Time Alert',
                  'Your departure time is less than 10 minutes away. Please book in advance for better service.',
                  [
                      {
                          text: 'Cancel Order',
                          onPress: () => {
                              console.log('Order cancelled');
                              setIsSubmitting(false);
                          },
                          style: 'cancel'
                      },
                      {
                          text: 'Continue Anyway',
                          onPress: () => {
                              proceedWithOrder(orderSubmitParam);
                          }
                      }
                  ],
                  { cancelable: false }
                );
            } else {
                // If the difference is more than 10 minutes, just execute the order submission
                proceedWithOrder(orderSubmitParam);
            }
        } catch (e) {
            console.log("下单异常", e);
            setIsSubmitting(false);
            showDialog('DANGER', 'Submit Order failed', 'Submit failed');
        }
    };

    const proceedWithOrder = (orderSubmitParam) => {
        userSubmitOrder(orderSubmitParam)
          .then(data => {
              responseOperation(data.code, () => {
                  setIsSubmitting(false);
                  userOrderWebsocket((body) => {}).then();
                  navigation.replace('OrderDetailScreen', {
                      departure,
                      destination,
                      date: date.toISOString(),
                      passengerCount,
                      pickupWaiting,
                      coords,
                      departureCoords: departureCoords,
                      destinationCoords: destinationCoords,
                  });
                  showToast('SUCCESS', 'Order Successfully', 'Place the order successfully and wait for the driver to pick up the order');
              }, () => {
                  setIsSubmitting(false);
                  showDialog('WARNING', 'Submit failed', 'Submit failed' + data.message);
              })
          }).catch((err) => {
            console.log(err);
            setIsSubmitting(false);
            showDialog('DANGER', 'Submit Order failed', 'Submit failed');
        });
    };


    // 处理下一步的逻辑，获取行程的距离和时间，如果已经确认预订，则跳转到订单详情页面
    const handleNextStep = () => {
        if (!departure || !destination || !date) {
            alert("Please fill in all fields!");
            setIsLoading(false);
            return;
        }

        setIsLoading(true); // 开始显示加载动画
        fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(departure)}&destination=${encodeURIComponent(destination)}&key=AIzaSyCTgmg64j-V2pGH2w6IgdLIofaafqWRwzc`)
            .then(response => response.json())
            .then(data => {
                if (data.routes.length)
                {
                    const legs = data.routes[0].legs[0];
                    const distance = legs.distance.text;
                    const duration = legs.duration.text;

                    const distanceDouble = legs.distance.value / 1000
                    const distanceKm = Math.round(distanceDouble);
                    const durationTime = Math.round(legs.duration.value / 60);
                    // const durationTime =10.21

                    orderPriceCheck(durationTime, distanceKm)
                        .then(data => {
                            responseOperation(data.code,()=>{
                                setOrderPrice(data.data);
                                setEstimatedDistance(distance);
                                setEstimatedDuration(duration);
                                setEstimatedDistanceOrder(distanceDouble);
                                setEstimatedDurationOrder(durationTime);
                                const steps = legs.steps;

                                const newCoords = steps.reduce((acc, step) => {
                                    const startLoc = step.start_location;
                                    const endLoc = step.end_location;
                                    return acc.concat([
                                        {latitude: startLoc.lat, longitude: startLoc.lng},
                                        {latitude: endLoc.lat, longitude: endLoc.lng}
                                    ]);
                                }, []);
                                setCoords(newCoords);

                                const latitudeList = newCoords.map(coord => coord.latitude);
                                const longitudeList = newCoords.map(coord => coord.longitude);
                                const minLatitude = Math.min(...latitudeList);
                                const maxLatitude = Math.max(...latitudeList);
                                const minLongitude = Math.min(...longitudeList);
                                const maxLongitude = Math.max(...longitudeList);

                                mapRef.current.fitToCoordinates([{
                                    latitude: minLatitude,
                                    longitude: minLongitude
                                }, {latitude: maxLatitude, longitude: maxLongitude}], {
                                    edgePadding: {top: 30, right: 30, bottom: 30, left: 30},
                                    animated: true,
                                });
                                setIsBookingConfirmed(true);
                                setTimeout(() => {
                                    // 延迟结束加载动画
                                    if (isLoadingRef.current) {
                                        setIsLoading(false);
                                    }
                                }, 1000); // 这是延迟的时间，你可以根据你的应用调整
                            },()=>{
                                console.log(data.message)
                                showDialog('WARNING', 'Get price error', data.message);
                                // setIsBookingConfirmed(false);
                                setIsLoading(false); // 立即停止加载动画
                            })
                        }).catch(err => {
                        setIsBookingConfirmed(false);
                        showDialog('DANGER', 'Get price error', 'Get price error, please try again later!');
                        console.error(err);
                        setIsLoading(false); // 立即停止加载动画
                    })

                }
            });

    };


    // 处理返回的逻辑，根据当前的状态，取消预订或返回到主页
    const handleBack = () => {
        if (isSuccessScreen) {
            setIsSuccessScreen(false);
        } else if (isBookingConfirmed) {
            setIsBookingConfirmed(false);
        }
    };

    const styles = {
        container: {
            flex: 1,
        },
        map: {
            flex: 1,
        },
    };

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{ flex: 1 }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
      >
        <NativeBaseProvider>
            <View style={styles.container}>
                <MapView
                    ref={mapRef} //用于保存对地图的引用
                    // onLayout={getCurrentLocation}
                    style={{...styles.map, marginBottom: Dimensions.get('window').height / 2}}
                    initialRegion={{
                        latitude: 2.9435,
                        longitude: 101.7654,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
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
                            pinColor="blue"
                        />
                    )}
                    {destinationCoords && (  // 判断是否有目的地坐标
                        <Marker
                            coordinate={destinationCoords}  // 设置标记的位置
                            title="Destination"  // 设置标记的标题（当用户点击标记时显示）
                        />
                    )}
                </MapView>


                {/*{!isSuccessScreen && !isBookingConfirmed && (*/}
                {/*    <Button variant="link" onPress={navigateHome} position="absolute" left={5} top={5}>*/}
                {/*        <RemixIcon name="arrow-left-circle-line" size={30} color="black"/>*/}
                {/*    </Button>*/}
                {/*)}*/}

                {isBookingConfirmed ? (
                    <Box
                        bg="white"
                        p={4}
                        w="100%"
                        h={Dimensions.get('window').height / 2}
                        position="absolute"
                        bottom={0}
                        borderTopRadius={10}
                    >
                        {/* Content for confirmed booking */}
                        <VStack space={4} alignItems="stretch">
                            <HStack justifyContent="space-between" alignItems="center">
                                <Button variant="unstyled" onPress={handleBack}>
                                    <Text>Back</Text>
                                </Button>
                                <Text>The estimated distance is: {estimatedDistance}</Text>
                            </HStack>
                            <HStack justifyContent="space-between" alignItems="center">
                                <Image
                                    source={{
                                        uri: 'https://cdn.pixabay.com/photo/2013/07/13/12/47/car-160343_1280.png',
                                    }}
                                    style={{width: 100, height: 100}}
                                />
                                <Text>{estimatedDuration}</Text>
                                <TouchableOpacity onPress={() => showToast('WARNING', 'Payment checking', 'We are only accept Cash now, E-wallet will be coming next update.')}>
                                    <Text>MYR {orderPrice} {'>'}</Text>
                                </TouchableOpacity>

                            </HStack>
                            <Input
                                placeholder="Remarks (Optional)"
                                value={remarks}
                                onChangeText={setRemarks}
                            />
                            {isSubmitting ? (
                                <HStack space={2} alignItems="center" justifyContent="center">
                                    <Spinner accessibilityLabel="Submitting order" size="lg" />
                                    <Heading color="primary.500" fontSize="lg">Submitting</Heading>
                                </HStack>
                            ) : (
                                <Button
                                    mt={4}
                                    onPress={submitOrder}
                                    style={{
                                        paddingVertical: 15,
                                        paddingHorizontal: 20,
                                        borderRadius: 10
                                    }}
                                >
                                    Done
                                </Button>
                            )}
                        </VStack>
                    </Box>
                ) : (
                    <Box
                        bg="white"
                        p={4}
                        w="100%"
                        h={Dimensions.get('window').height / 2}
                        position="absolute"
                        bottom={0}
                        borderTopRadius={10}
                    >
                        <VStack space={4} alignItems="stretch">
                            <HStack space={2} alignItems="center">
                                <RemixIcon name="map-pin-line" size={20} color="blue"/>
                                <Input
                                    flex={1}
                                    placeholder="Departure"
                                    value={departure}
                                    onChangeText={(text) => {
                                        setIsDepartureSelected(false); // 用户开始输入新的出发地，重置状态
                                        setIsDepartureManual(true); // 用户开始输入departure
                                        setDeparture(text);
                                        updateAddressSuggestions(text, setDepartureSuggestions);
                                    }}
                                />
                            </HStack>
                            {showDepartureSuggestions && departureSuggestions.slice(0, 5).map((suggestion) => (
                                <Text
                                    key={suggestion.place_id}
                                    onPress={async () => {
                                        setIsDepartureSelected(true);
                                        let addressParts = suggestion.description.split(','); // Split the address into parts
                                        let shortAddress = addressParts.slice(0, 2).join(','); // Join the first two parts
                                        setDeparture(shortAddress); // 然后更新出发地的值
                                        setDepartureAddress(suggestion.terms); // 然后更新出发地的值
                                        setShowDepartureSuggestions(false); // 先关闭推荐列表

                                        // 获取新的出发地的经纬度
                                        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(shortAddress)}&key=AIzaSyCTgmg64j-V2pGH2w6IgdLIofaafqWRwzc`);
                                        const data = await response.json();
                                        const location = data.results[0].geometry.location;
                                        setDepartureCoords({latitude: location.lat, longitude: location.lng}); // 这里保存新的出发地的经纬度
                                        await moveToLocation(suggestion.place_id); // 这里添加代码使地图移动到新的出发地
                                    }}
                                >
                                    {suggestion.description}
                                </Text>
                            ))}
                            <HStack space={2} alignItems="center">
                                <RemixIcon name="flag-line" size={20} color="orange"/>
                                <Input
                                    flex={1}
                                    placeholder="Destination"
                                    value={destination}
                                    onChangeText={(text) => {
                                        setIsDestinationSelected(false);
                                        setDestination(text);
                                        updateAddressSuggestions(text, setDestinationSuggestions).then();
                                    }}
                                />
                            </HStack>
                            {showDestinationSuggestions && destinationSuggestions.slice(0, 5).map((suggestion) => (
                                <Text
                                    key={suggestion.place_id}
                                    onPress={async () => {
                                        setIsDestinationSelected(true);
                                        let addressParts = suggestion.description.split(','); // Split the address into parts
                                        let shortAddress = addressParts.slice(0, 2).join(','); // Join the first two parts
                                        setDestination(shortAddress); // 更新目的地的值
                                        setDestinationAddress(suggestion.terms); // 更新目的地的值
                                        setShowDestinationSuggestions(false); // 先关闭推荐列表
                                        // 获取新的目的地的经纬度
                                        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(shortAddress)}&key=AIzaSyCTgmg64j-V2pGH2w6IgdLIofaafqWRwzc`);
                                        const data = await response.json();
                                        const location = data.results[0].geometry.location;

                                        setDestinationCoords({latitude: location.lat, longitude: location.lng});

                                        // 路径规划的逻辑已经移到 handleNextStep 函数中，这里不再需要
                                    }}
                                >
                                    {suggestion.description}
                                </Text>
                            ))}
                            <Pressable onPress={handleOpenDatePicker}
                                       style={{flexDirection: 'row', alignItems: 'center'}}>
                                <HStack space={2} alignItems="center">
                                    <RemixIcon name="calendar-2-fill" size={20} color="green"/>
                                    <Box flex={1} borderWidth={1} borderColor="#ddd" borderRadius={4} p={2}>
                                        <Text flexShrink={1}>{date ? formatDate(new Date(date)) : 'Select Time'}</Text>
                                    </Box>
                                </HStack>
                            </Pressable>
                            <Pressable onPress={() => setModalVisible(true)}
                                       style={{flexDirection: 'row', alignItems: 'center'}}>
                                <HStack space={2} alignItems="center">
                                    <RemixIcon name="group-line" size={20} color="black"/>
                                    <Box flex={1} borderWidth={1} borderColor="#ddd" borderRadius={4} p={2}>
                                        <Text
                                            flexShrink={1}>{`${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`}</Text>
                                    </Box>
                                </HStack>
                            </Pressable>
                            {isLoading ? (
                                <HStack space={2} alignItems="center" justifyContent="center">
                                    <Spinner accessibilityLabel="Loading posts" size="lg"/>
                                    <Heading color="primary.500" fontSize="lg">Loading</Heading>
                                </HStack>
                            ) : (
                                <Button
                                    mt={4}
                                    onPress={allowOrder}
                                    style={{
                                        paddingVertical: 15,
                                        paddingHorizontal: 20,
                                        borderRadius: 10
                                    }}
                                >
                                    Next Step
                                </Button>
                            )}
                            <DatePicker
                                modal
                                open={open}
                                date={date || new Date()}
                                minimumDate={new Date()}
                                onConfirm={(date) => {
                                    setOpen(false);
                                    setDate(date);
                                }}
                                onCancel={() => {
                                    setOpen(false);
                                }}
                            />
                            <Modal
                                isOpen={modalVisible}
                                onClose={() => setModalVisible(false)}
                                avoidKeyboard
                                justifyContent="flex-end"
                                bottom="4"
                            >
                                <Modal.Content
                                    maxWidth="100%"
                                    width={Dimensions.get('window').width}
                                    alignSelf="center"
                                >
                                    <Modal.CloseButton/>
                                    <Modal.Header>How many of you will go?</Modal.Header>
                                    <Modal.Body>
                                        <VStack space={4} alignItems="center">
                                            <HStack justifyContent="space-between" alignItems="center" width="100%">
                                                <Button
                                                    width="25%" // 调整宽度至20%
                                                    onPress={() => setPassengerCount(passengerCount > 1 ? passengerCount - 1 : 1)}
                                                >
                                                    -
                                                </Button>
                                                <Text fontSize="xl">{passengerCount}</Text>
                                                <Button
                                                    width="25%" // 调整宽度至20%
                                                    onPress={() => setPassengerCount(passengerCount + 1)}
                                                >
                                                    +
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {isLoading ? (
                                            <ActivityIndicator size="large" color="#0000ff"/>
                                        ) : (
                                            <Button
                                                flex="1"
                                                onPress={closeModal}
                                            >
                                                Done
                                            </Button>
                                        )}
                                    </Modal.Footer>
                                </Modal.Content>
                            </Modal>
                        </VStack>
                    </Box>
                )}
            </View>
        </NativeBaseProvider>
      </KeyboardAwareScrollView>
    );
};

export default RideOrderScreen;
