import React, { useState, useRef } from "react";
import { NativeBaseProvider, Box, VStack, HStack, Button, Text, Avatar, Input, Image, Spinner } from "native-base";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
  Platform,
  Keyboard, SafeAreaView,
} from "react-native";
import { StyleSheet } from "react-native";
import Geocoder from "react-native-geocoding";
import RemixIcon from "react-native-remix-icon";
import {
  driverCancelOrder,
  driverGetPasserCode, driverOrderCompleted,
  driverOrderInfo, driverOrderStart, driverQueryUserPhone, driverReviewOrder, queryDriverOrderStatus,
} from "../com/evotech/common/http/BizHttpUtil";
import {OrderStateDescEnum, OrderStateEnum} from "../com/evotech/common/constant/BizEnums";
import { Rating } from "react-native-ratings";
import RBSheet from "react-native-raw-bottom-sheet";
import { format } from "date-fns";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import { closeWebsocket } from "../com/evotech/common/websocket/SingletonWebSocketClient";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import { formatDate } from "../com/evotech/common/formatDate";
import { googleMapsApiKey } from "../com/evotech/common/apiKey/mapsApiKey";
import { driverCancelSubscribe } from "../com/evotech/common/websocket/UserChatWebsocket";
import { useDispatch } from "react-redux";
import {  deleteChatByOrderId } from "../com/evotech/common/redux/chatSlice";


Geocoder.init(googleMapsApiKey);

const DriverAcceptDetailScreen = ({ route, navigation }) => {
  const {
    Departure,
    Destination,
    Time,
    Price,
    Status,
    orderDetailInfo,
    userOrderId,
    DepartureCoords,
    DestinationCoords,
  } = route.params;
  // const [existDriverInfo, setExistDriverInfo] = useState(false);
  const [rating, setRating] = useState(5);
  const dispatch = useDispatch();
  const refRBSheet = useRef();  // 引用RBSheet

  const cancelReasonRef = useRef("");
  const reviewRef = useRef("");
  const refRBSheetPayment = useRef();  // 引用RBSheet for PaymentInfoBox
  const refRBSheetReview = useRef();  // 引用RBSheet for ReviewBox

  const [isLoading, setIsLoading] = useState(false);


  const handleCancel = () => {
    refRBSheet.current.open();
  };

  const handleConfirmCancel = () => {
    const cancelOrderParam = {
      driverOrderId: orderDetailInfo.driverOrderId,
      userOrderId: userOrderId,
      cancelReason: cancelReasonRef.current.trim() === "" ? "No Reason" : cancelReasonRef.current,
      cancelDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
    driverCancelOrder(cancelOrderParam)
      .then(data => {
        responseOperation(data.code, () => {
            showToast("SUCCESS", "Success", "Order successfully cancelled");
            dispatch(deleteChatByOrderId(orderDetailInfo.driverOrderId));
            driverCancelSubscribe().then();
            navigation.goBack(); // After canceling the order, return to the previous screen.
        }, () => {
            showDialog("WARNING", "Warning", "Order cancellation failed, Please try again later!");
        })
      }).catch(error => {
      showDialog("DANGER", "Error", "System error: " + error.message);
    });
    refRBSheet.current.close();
  };

  const startChat = (userOrderId) => {
    const params = {
      orderId: userOrderId,
    };
    driverGetPasserCode(params)
      .then(data => {
        responseOperation(data.code, () => {
          navigation.navigate("ChatRoom", {
            receiverName: data.data.userName,
            receiverUserCode: data.data.userCode,
            orderStatus: Status,
            orderId: orderDetailInfo.driverOrderId,
            receiverOrderId: orderDetailInfo.userOrderId,
            needQueryOrderStatus: false,
          });
        },()=>{
          showDialog("WARNING", "Warning", data.message);
        })
      }).catch(err => {
      console.error(err.message);
      showDialog("DANGER", "Error", "Failed to get user info, please try again later!");
    });
  };

  const driverOrderStatusCallBack = () => {
    setTimeout(() => {
      //删除当前订单的聊天记录
      dispatch(deleteChatByOrderId(orderDetailInfo.driverOrderId));
      queryDriverOrderStatus().then(data => {
        responseOperation(data.code, () => {
            const orderStatus = data.data;
            if (!(orderStatus.pending || orderStatus.inTransit)) {
              closeWebsocket();
            }
        })
      });
    }, 0);
  };
  // 更新页面数据
  const fetchDataAndUpdateParams = () => {
    const queryParam = {
      driverOrderId: orderDetailInfo.driverOrderId,
      userOrderId: userOrderId,
    };
    driverOrderInfo(queryParam)
      .then(data => {
        responseOperation(data.code, () => {
          navigation.setParams({
            Departure: Departure,
            Destination: Destination,
            Time: data.data.actualDepartureTime,
            Price: Price,
            Status: data.data.orderState,
            orderDetailInfo: data.data,
            userOrderId: userOrderId,
            DepartureCoords: DepartureCoords,
            DestinationCoords: DestinationCoords,
          });
        }, () => {
            showDialog("WARNING", "Warning", data.message);
        })
      });
  };

  const updateTravelStatus = async (timePropertyName, apiFunction) => {
    // 设置 isLoading 为 true，开始显示 spinner
    setIsLoading(true);
    try {
      const param = {
        driverOrderId: orderDetailInfo.driverOrderId,
        userOrderId: orderDetailInfo.userOrderId,
        [timePropertyName]: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
      apiFunction(param).then(data => {
        // 添加一些延迟以便能看到 Spinner
        setTimeout(() => {
          responseOperation(data.code, () => {
            fetchDataAndUpdateParams();
            // 判断 是否需要关闭websocket
            if (timePropertyName === "actualArrivalTime") {
              driverOrderStatusCallBack();
            }
          }, () => {
            showDialog("WARNING", "Warning", data.message);
          });
          // 不论成功还是失败，都设置 isLoading 为 false，停止显示 spinner
          setIsLoading(false);
        }, 500);  // 这里的2000是延迟的毫秒数，你可以根据需要调整
      });
    } catch (error) {
      showDialog("DANGER", "Error", "Request failed, please try again later.");
      console.error(error);
      // 出错时，也设置 isLoading 为 false，停止显示 spinner
      setIsLoading(false);
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
        showDialog("DANGER", "Error", "Sorry, no navigation application found on your device");
      }
    } catch (error) {
      // 如果其他错误发生，抛出错误
      console.error("An error occurred", error);
      showToast("DANGER", "Error", "Unable to open navigation, an error occurred");
    }
  };
/*  useEffect(() => {
    setExistDriverInfo(orderDetailInfo.driverOrderId !== "");
  }, []);*/


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height * 0.45, // 让地图占据40%的屏幕
    },
    box: {
      padding: 5,
      marginTop: 10,
    },
    driverInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    fullScreen: {
      height: Dimensions.get("window").height * 0.55, // 让box占据60%的屏幕
    },
    licensePlateText: {
      fontSize: 20, // 1.5 times the usual size, adjust as needed
      fontWeight: "bold",
      alignSelf: "flex-start",
      right: -93,
    },
  });

  const styles1 = StyleSheet.create({
    buttonStyle: {
      backgroundColor: "white",
      borderRadius: 0,
      padding: 10,
    },
    textStyle: {
      color: "black",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  const reviewOrder = (rating, review) => {
    const param = {
      orderId: orderDetailInfo.driverOrderId,
      reviewContent: review,
      satisfaction: rating,
      reviewTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
    driverReviewOrder(param).then(data => {
      responseOperation(data.code, () =>{
          fetchDataAndUpdateParams();
      }, () => {
        showDialog("DANGER", "Error", data.message);
        }
      )
    }).catch(err => {
      console.error(err.message);
      showDialog("DANGER", "Error", "Failed to submit review, please try again later!");
    });
  };
  const ReviewBox = () => (
    <InfoBox>
      <VStack space={4} alignItems="stretch">
        <Rating
          type="star"
          ratingCount={5}
          imageSize={40}
          // fractions={1}
          startingValue={5}
          onFinishRating={(rating) => setRating(rating)}
        />
        <Input
          placeholder="Write your review here..."
          onChangeText={value => reviewRef.current = value}
        />
        <Button
          onPress={() => {
            Keyboard.dismiss();
            reviewOrder(rating, reviewRef.current);
          }}
        >
          Submit
        </Button>
      </VStack>
    </InfoBox>
  );

  const InfoBox = ({ status, children }) => (
    <VStack>
      {status && (
        <Box bg={status.color} p={2} width="100%">
          <Text>{status.text}</Text>
        </Box>
      )}
      <Box bg="white" shadow={0} p={4}>
        <VStack space={4} mt={1}>
          {children}
        </VStack>
      </Box>
    </VStack>
  );
  const OrderInfoBox = () => {
    let statusColor;
    switch (Status) {
      case OrderStateEnum.PENDING:
        statusColor = "#FFFF00"; // yellow
        break;
      case OrderStateEnum.IN_TRANSIT:
        statusColor = "#82E0AA"; // green
        break;
      case OrderStateEnum.DELIVERED:
        statusColor = "#808080"; // gray
        break;
      case OrderStateEnum.CANCELLED:
        statusColor = "#808080"; // gray
        break;
      default:
        statusColor = "#808080"; // default to gray
    }

    const actionSheet = useRef();

    //  const [animatePress, setAnimatePress] = useState(new Animated.Value(1));

    /*   const animateIn = () => {
         Animated.timing(animatePress, {
           toValue: 0.5,
           duration: 500,
           useNativeDriver: true, // Add This line
         }).start();
       };*/
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

    const openSystemPhone = (orderId) => {
      const params = {
        orderId: orderId,
      };
      driverQueryUserPhone(params).then((response) => {
        responseOperation(response.code, () => {
          let phoneNumber = response.data;
          phoneNumber = `tel://${phoneNumber}`;
          if (Platform.OS === "android") {
            Linking.openURL(phoneNumber);
          } else {
            Linking.canOpenURL(phoneNumber).then((supported) => {
              if (!supported) {
                showToast("WARNING", "ACTION DENIED", "No permission to make a call");
              } else {
                Linking.openURL(phoneNumber);
              }
            }).catch((err) => {
              showToast("WARNING", "An error occurred", err);
            });
          }

        }, () => {
          showToast("WARNING", "An error occurred", response.message);
        });
      }).catch((error) => {
        showToast("WARNING", "An error occurred", error.message);
      });
    };


    return (
      <InfoBox status={{ color: statusColor, text: OrderStateDescEnum[Status].DRIVER }}>
        <VStack space={3}>
          {Status !== OrderStateEnum.CANCELLED && Status !== OrderStateEnum.COMPLETED && Status !== OrderStateEnum.DELIVERED && (
            <View style={{ position: "relative" }}>
              {(Status === OrderStateEnum.PENDING) && (
                <View>
                  <Text>Arrive Before <Text fontWeight="bold" color="#0000FF">{formatDate(new Date(Time))} </Text>For
                    Pickup.</Text>
                  <TouchableOpacity onPress={handleCancel} style={{ alignSelf: "flex-start" }}>
                    <Text fontSize="sm" style={{ fontWeight: "bold" }}>CANCEL?</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(Status === OrderStateEnum.IN_TRANSIT) && (
                <View>
                  <Text>Focus On Driving, Enjoy Your Journey.</Text>
                  <TouchableOpacity onPress={() => Linking.openURL("tel://999")}
                                    style={{ alignSelf: "flex-start" }}>
                    <Text fontSize="sm" style={{ fontWeight: "bold" }}>Emergency Call</Text>
                  </TouchableOpacity>
                </View>
              )}
              <RBSheet
                ref={refRBSheet}
                height={Dimensions.get("window").height * 0.25}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                  wrapper: {
                    backgroundColor: "transparent",
                  },
                  draggableIcon: {
                    backgroundColor: "#000",
                  },
                }}
              >
                <View style={styles.container}>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 18, marginBottom: 10 }}>Do you want to cancel the
                      order?</Text>
                    <Input
                      mt={4}  // Add margin to the top
                      mb={4}  // Add margin to the bottom
                      placeholder="Reason for cancellation (OPTIONAL)"
                      onChangeText={text => cancelReasonRef.current = text}// onEndEditing={text => setCancelReason(text)}
                    />

                    <Button style={{ backgroundColor: '#2E86C1' }} onPress={handleConfirmCancel}>
                      <Text style={styles1.textStyle}>Confirm Cancel</Text>
                    </Button>
                  </View>
                </View>
              </RBSheet>
              <TouchableWithoutFeedback onPress={showActionSheet}>
                <Image
                  source={require("../picture/navigation.png")}
                  style={{
                    position: "absolute",
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
                options={["Departure", "Destination", "Cancel"]}
                cancelButtonIndex={2}
                onPress={handleActionSheetPress}
              />
            </View>
          )}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text fontSize="sm">
                {orderDetailInfo.passengersNumber} {orderDetailInfo.passengersNumber > 1 ? "Passengers" : "Passenger"} · {orderDetailInfo.paymentType}
              </Text>
            </View>
            <TouchableOpacity onPress={() => refRBSheetPayment.current.open()}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text fontSize="xl" fontWeight="bold">RM {Price}</Text>
                <Text fontSize="xs"> {">"} </Text>
              </View>
            </TouchableOpacity>
          </View>
          {Status !== OrderStateEnum.CANCELLED && Status !== OrderStateEnum.COMPLETED && (
            <HStack justifyContent="space-between" alignItems="center" px={0}>
              <HStack space={4} alignItems="center">
                <Avatar
                  size="md"
                  source={require('../picture/person.jpg')}
                />
                <VStack>
                  <Text fontWeight="bold">{orderDetailInfo.userName}</Text>
                  <View style={{maxWidth: 230}}>
                    <Text>{orderDetailInfo.remark}</Text>
                  </View>
                </VStack>
              </HStack>
              <HStack alignItems="center" space={4}>
                <TouchableOpacity onPress={() => {
                  openSystemPhone(userOrderId);
                }}>
                  <View style={{
                    borderWidth: 1,
                    borderColor: "black",
                    borderRadius: 50,
                    padding: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <RemixIcon name="phone-line" size={20} color="black" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  startChat(userOrderId);
                }}>
                  <View style={{
                    borderWidth: 1,
                    borderColor: "black",
                    borderRadius: 50,
                    padding: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <RemixIcon name="message-3-line" size={20} color="black" />
                  </View>
                </TouchableOpacity>
              </HStack>
            </HStack>
          )}

          <HStack space={2} alignItems="flex-start" style={{ flexWrap: "wrap" }}>
            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" style={{ marginTop: 5 }} />
            <Text style={{ flex: 1 }}>{Departure}</Text>
          </HStack>
          <HStack space={2} alignItems="flex-start" style={{ flexWrap: "wrap" }}>
            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" style={{ marginTop: 5 }} />
            <Text style={{ flex: 1 }}>{Destination}</Text>
          </HStack>
          <HStack space={2} alignItems="center">
            <RemixIcon name="time-fill" size={15} color="black" />
            <Text>Time: {formatDate(new Date(Time))}</Text>
          </HStack>
          {Status === OrderStateEnum.DELIVERED ? (
            <Button
              bg="#f0f0f0"
              onPress={() => refRBSheetReview.current.open()}
              variant="ghost"
              style={{ height: 40, justifyContent: "center", flex: 1 }}
            >
              <HStack space={2}>
                <RemixIcon name="star-line" size={24} color="black" />
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
        {(orderDetailInfo.settlementFailureReason !== "") && <HStack>
          <Text>Settlement Status: {orderDetailInfo.settlementFailureReason}</Text>
        </HStack>}
      </VStack>
    </InfoBox>
  );
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
        <Marker pinColor="blue" coordinate={{ latitude: DepartureCoords.lat, longitude: DepartureCoords.lng }} />
        <Marker coordinate={{ latitude: DestinationCoords.lat, longitude: DestinationCoords.lng }} />
      </MapView>
    </>
  );
  const renderContentBasedOnStatus = () => {
    switch (Status) {
      //待出行
      case OrderStateEnum.PENDING:
        return (
          <ScrollView style={styles.fullScreen}>
            {DepartureCoords && DestinationCoords && <MapComponent />}
            <OrderInfoBox showStatus={true} />
            <RBSheet
              ref={refRBSheetPayment}
              closeOnDragDown={true}
              closeOnPressMask={true}
              height={Dimensions.get("window").height * 0.214} // 设置RBSheet占据50%的屏幕高度
            >
              <PaymentInfoBox />
            </RBSheet>
          </ScrollView>
        );
      //旅途中
      case OrderStateEnum.IN_TRANSIT:
        return (
          <>
            {DepartureCoords && DestinationCoords && (
              <ScrollView style={styles.fullScreen}>
                <MapComponent />
                <OrderInfoBox showStatus={false} />
                <RBSheet
                  ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                  closeOnDragDown={true}
                  closeOnPressMask={true}
                  height={Dimensions.get("window").height * 0.214}
                >
                  <PaymentInfoBox />
                </RBSheet>
              </ScrollView>
            )}
          </>
        );
      // 已送达
      case OrderStateEnum.DELIVERED:
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.fullScreen}>
              <OrderInfoBox showStatus={true} />
              <RBSheet
                ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.214}
              >
                <PaymentInfoBox />
              </RBSheet>
              <RBSheet
                ref={refRBSheetReview} // 添加了一个新的RBSheet
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.31}
              >
                <ReviewBox />
              </RBSheet>
            </ScrollView>
          </SafeAreaView>
        );

      //已取消
      case OrderStateEnum.CANCELLED:
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.fullScreen}>
              <OrderInfoBox showStatus={true} />
              <RBSheet
                ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.214}
              >
                <PaymentInfoBox />
              </RBSheet>
            </ScrollView>
          </SafeAreaView>
        );

      //已完成
      case OrderStateEnum.COMPLETED:
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.fullScreen}>
              <OrderInfoBox showStatus={true} status={Status} />
              {/*{existDriverInfo && <DriverInfoBox showBack={existDriverInfo}/>}*/}
              <RBSheet
                ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.214}
              >
                <PaymentInfoBox />
              </RBSheet>
            </ScrollView>
          </SafeAreaView>
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
            disabled={isLoading} // 当 isLoading 为 true 时，禁用按钮
            onPress={() => updateTravelStatus("departureTime", driverOrderStart)}
            style={{
              width: "90%",
              alignSelf: "center",
              marginTop: 10,
              marginBottom: 30,
              height: 50,
              backgroundColor: "#002d66",
            }}
          >
            {isLoading ? <Spinner color="white" /> : 'Arrived at the passenger starting point'}
          </Button>
        }
        {
          Status === OrderStateEnum.IN_TRANSIT &&
          <Button
            disabled={isLoading} // 当 isLoading 为 true 时，禁用按钮
            onPress={() => updateTravelStatus("actualArrivalTime", driverOrderCompleted)}
            style={{
              width: "90%",
              alignSelf: "center",
              marginTop: 10,
              marginBottom: 30,
              height: 50,
              backgroundColor: "#002d66",
            }}
          >
            {isLoading ? <Spinner color="white" /> : 'Order completed'}
          </Button>
        }
      </View>
    </NativeBaseProvider>
  );
};
export default DriverAcceptDetailScreen;
