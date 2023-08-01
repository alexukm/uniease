import React, { useState, useEffect, useRef } from "react";
import { NativeBaseProvider, Box, VStack, HStack, Button, Text, Avatar, Input } from "native-base";
import MapView, { Marker } from "react-native-maps";
import { View, Dimensions, ScrollView, TouchableOpacity, Platform, Linking, SafeAreaView } from "react-native";
import { StyleSheet } from "react-native";
import Geocoder from "react-native-geocoding";
import RemixIcon from "react-native-remix-icon";
import {
  userOrderInfo,
  userReviewOrder,
  userCancelOrder,
  passerGetDriverCode, userQueryDriverPhone,
} from "../com/evotech/common/http/BizHttpUtil";
import {OrderStateDescEnum, OrderStateEnum} from "../com/evotech/common/constant/BizEnums";
import { Rating } from "react-native-ratings";
import RBSheet from "react-native-raw-bottom-sheet";
import { format } from "date-fns";
import { googleMapsApiKey } from "../com/evotech/common/apiKey/mapsApiKey";
import { userCancelSubscribe } from "../com/evotech/common/websocket/UserChatWebsocket";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import { formatDate } from "../com/evotech/common/formatDate";


Geocoder.init(googleMapsApiKey);

const UserOrderDetailScreen = ({ route, navigation }) => {
  const {
    Departure,
    Destination,
    Time,
    Price,
    Status,
    orderDetailInfo,
    DepartureCoords,
    DestinationCoords,
  } = route.params;
  const [existDriverInfo, setExistDriverInfo] = useState(false);

  const refRBSheet = useRef();  // 引用RBSheet
  const [rating, setRating] = useState(5);
  const reviewRef = useRef("");

  const refRBSheetPayment = useRef();  // 引用RBSheet for PaymentInfoBox
  const refRBSheetReview = useRef();  // 引用RBSheet for ReviewBox

  const cancelReasonRef = useRef("");

  const handleCancel = () => {
    refRBSheet.current.open();
  };

  const handleConfirmCancel = () => {
    const cancelOrderParam = {
      orderId: orderDetailInfo.orderId,
      cancelReason: cancelReasonRef.current.trim() === "" ? "No Reason" : cancelReasonRef.current,
      cancelDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };

    userCancelOrder(cancelOrderParam)
      .then(data => {
        responseOperation(data.code, () => {
          showToast("SUCCESS", "Success", "Cancelled Order Successfully");
          userCancelSubscribe().then();
          navigation.goBack(); // After canceling the order, return to the previous screen.
        }, () => {
          showDialog("WARNING", "Failed", "Cancel Order failed, Please try again later!");
        });
      }).catch(error => {
      console.log(error);
      showDialog("DANGER", "Error", "System error: " + error.message);
    });
    refRBSheet.current.close();
  };

  useEffect(() => {
    setExistDriverInfo(orderDetailInfo.driverOrderId !== "");
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height * 0.55, // 让地图占据40%的屏幕
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
      height: Dimensions.get("window").height * 0.45, // 让box占据60%的屏幕
    },
    licensePlateText: {
      fontSize: 20, // 1.5 times the usual size, adjust as needed
      fontWeight: "bold",
      alignSelf: "flex-end",
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


  const skipChatRoom = (data) =>{
    navigation.navigate("ChatRoom", {
      receiverName: data.data.userName,
      receiverUserCode: data.data.userCode,
      orderStatus: Status,
    });
  }
  const openChatRoom = () => {
    const params = {
      orderId: orderDetailInfo.driverOrderId,
    };
    console.log(orderDetailInfo.driverOrderId);
    passerGetDriverCode(params)
      .then(data => {
        responseOperation(data.code, () => {
          skipChatRoom(data);
        }, () => {
          showDialog("WARNING", "Warning", data.message);
        });
      }).catch(err => {
      console.error(err.message);
      showDialog("DANGER", "Error", "Get user info failed, please try again later!");
    });
  };
  const fetchDataAndUpdateParams = () => {
    const queryParam = {
      orderId: orderDetailInfo.orderId,
    };
    userOrderInfo(queryParam)
      .then(data => {
        responseOperation(data.code, () => {
          navigation.setParams({
            Departure: Departure,
            Destination: Destination,
            Time: data.data.actualDepartureTime,
            Price: Price,
            Status: data.data.orderState,
            orderDetailInfo: data.data,
            userOrderId: orderDetailInfo.orderId,
            DepartureCoords: DepartureCoords,
            DestinationCoords: DestinationCoords,
          });
        }, () => {
          showDialog("DANGER", "Error", "Error", data.message);
        });
      });
  };

  const reviewOrder = (satisfaction, reviewContent) => {

    const param = {
      orderId: orderDetailInfo.orderId,
      reviewContent: reviewContent,
      satisfaction: satisfaction,
      reviewTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
    userReviewOrder(param).then(data => {
      responseOperation(data.code, () => {
        fetchDataAndUpdateParams();
      }, () => {
        showDialog("WARNING", "Error", "Submit review failed,please try again later!");
      });
    }).catch(err => {
      console.error(err.message);
      showDialog("DANGER", "Error", "Submit review failed,please try again later!");
    });
  };


  const openSystemPhone = (response) => {
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
        console.error("An error occurred", err);
      });
    }
  };

  const userOpenSystemPhone = (orderId) => {
    const params = {
      orderId: orderId,
    };
    userQueryDriverPhone(params).then((response) => {
      responseOperation(response.code, () => {
        openSystemPhone(response);
      }, () => {
        showDialog('DANGER','ERROR', response.message)
      });
    }).catch((error) => {
      showDialog('DANGER','ERROR', error.message)
    });
  };
  const ReviewBox = () => (
    <InfoBox title="Comment your driver">
      <VStack space={4} alignItems="stretch">
        <Rating
          type="star"
          ratingCount={5}
          imageSize={40}
          startingValue={5}
          onFinishRating={(rating) => setRating(rating)}
        />
        <Input
          placeholder="Write your review here..."
          multiline
          onChangeText={value => reviewRef.current = value}
        />
        <Button onPress={() => reviewOrder(rating, reviewRef.current)}>
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
        <VStack space={4} mt={1.2}>
          {children}
        </VStack>
      </Box>
    </VStack>
  );
  const OrderInfoBox = () => {
    let statusColor;
    switch (Status) {
      case OrderStateEnum.AWAITING:
        statusColor = "#2E86C1"; // blue
        break;
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
    return (
      <InfoBox status={{ color: statusColor, text: OrderStateDescEnum[Status].PASSER }}>
        <VStack space={4}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text
                fontSize="sm">{formatDate(new Date(Time))}·  {orderDetailInfo.passengersNumber} {orderDetailInfo.passengersNumber > 1 ? "Passengers" : "Passenger"}</Text>
              {(Status === OrderStateEnum.AWAITING || Status === OrderStateEnum.PENDING) && (
                <TouchableOpacity onPress={handleCancel}>
                  <Text fontSize="sm" style={{ color: "blue", fontWeight: "bold" }}>Cancel Order?</Text>
                </TouchableOpacity>
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
                      onChangeText={text => cancelReasonRef.current = text}
                    />
                    <Button style={{ backgroundColor: '#2E86C1' }} onPress={handleConfirmCancel}>
                      <Text style={styles1.textStyle}>Confirm Cancel</Text>
                    </Button>
                  </View>
                </View>
              </RBSheet>
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => refRBSheetPayment.current.open()}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text fontSize="xl" fontWeight="bold">RM {Price}</Text>
                    <Text fontSize="xs"> {">"} </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <HStack space={2} alignItems="center" style={{ flexWrap: "wrap" }}>
            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" />
            <Text style={{ flex: 1 }}>{Departure}</Text>
          </HStack>
          <HStack space={2} alignItems="center" style={{ flexWrap: "wrap" }}>
            <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" />
            <Text style={{ flex: 1 }}>{Destination}</Text>
          </HStack>
        </VStack>
      </InfoBox>
    );
  };
  const PaymentInfoBox = () => (
    <InfoBox>
      <VStack space={4} alignItems="stretch">
        <HStack>
          <Text>Order No: {orderDetailInfo.orderId}</Text>
        </HStack>
        <HStack>
          <Text>Payment No: {orderDetailInfo.payNo}</Text>
        </HStack>
        <HStack>
          <Text>Payment Method: {orderDetailInfo.paymentType}</Text>
        </HStack>
        <HStack>
          <Text>Payment Amount: {orderDetailInfo.price}</Text>
        </HStack>
        <HStack>
          <Text>Payment Status: {orderDetailInfo.orderState}</Text>
        </HStack>
      </VStack>
    </InfoBox>
  );

  const DriverInfoBox = ({ status }) => (
    <InfoBox>
      <VStack space={4} alignItems="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Avatar
              size="lg"
              source={require('../picture/person.jpg')}
            />
            <Text>Driver: {orderDetailInfo.userName}</Text>
          </VStack>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ ...styles.licensePlateText, lineHeight: 30 }}>
              {orderDetailInfo.licensePlate.toUpperCase()}
            </Text>
            <Text style={{ lineHeight: 30 }}>
              {orderDetailInfo.carColor.toUpperCase()} - {orderDetailInfo.carBrand.toUpperCase()}
            </Text>
          </View>
        </HStack>
        {status !== OrderStateEnum.DELIVERED ? (
          <HStack space={2}>
            <Button
              bg="#f0f0f0"
              onPress={() => openChatRoom()}
              variant="ghost"
              style={{ height: 40, justifyContent: "center", flex: 8 }} // 添加自定义样式
            >
              <HStack space={2}>
                <RemixIcon name="message-3-line" size={24} color="black" />
                <Text>Chat</Text>
              </HStack>
            </Button>
            <Button
              bg="#e0e0e0"
              onPress={() => {
                userOpenSystemPhone(orderDetailInfo.driverOrderId);
              }}
              variant="ghost"
              style={{ height: 40, justifyContent: "center", flex: 2 }} // 添加自定义样式
            >
              <HStack space={2}>
                <RemixIcon name="phone-line" size={24} color="black" />
              </HStack>
            </Button>
          </HStack>
        ) : (
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
        )}
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
          latitudeDelta: Math.abs(DepartureCoords.lat - DestinationCoords.lat) * 2 * 0.65,
          longitudeDelta: Math.abs(DepartureCoords.lng - DestinationCoords.lng) * 2 * 0.65,
        }}
      >
        <Marker pinColor="blue" coordinate={{ latitude: DepartureCoords.lat, longitude: DepartureCoords.lng }} />
        <Marker coordinate={{ latitude: DestinationCoords.lat, longitude: DestinationCoords.lng }} />
      </MapView>
    </>
  );

  const renderContentBasedOnStatus = () => {
    switch (Status) {
      //待接单AWAITING
      case OrderStateEnum.AWAITING:
        return (
          <ScrollView style={styles.fullScreen}>
            {DepartureCoords && DestinationCoords && <MapComponent />}
            <OrderInfoBox showStatus={true} />
            <RBSheet
              ref={refRBSheetPayment}
              closeOnDragDown={true}
              closeOnPressMask={true}
              height={Dimensions.get("window").height * 0.31} // 设置RBSheet占据50%的屏幕高度
            >
              <PaymentInfoBox />
            </RBSheet>
          </ScrollView>
        );
      //待出行
      case OrderStateEnum.PENDING:
        return (
          <ScrollView style={styles.fullScreen}>
            {DepartureCoords && DestinationCoords && <MapComponent />}
            <OrderInfoBox showStatus={true} />
            {existDriverInfo && <DriverInfoBox />}
            <RBSheet
              ref={refRBSheetPayment}
              closeOnDragDown={true}
              closeOnPressMask={true}
              height={Dimensions.get("window").height * 0.31} // 设置RBSheet占据50%的屏幕高度
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
                {existDriverInfo && <DriverInfoBox />}
                <RBSheet
                  ref={refRBSheetPayment}
                  closeOnDragDown={true}
                  closeOnPressMask={true}
                  height={Dimensions.get("window").height * 0.31} // 设置RBSheet占据50%的屏幕高度
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
              <DriverInfoBox status={Status} />
              <RBSheet
                ref={refRBSheetPayment} // 修改这里使用了refRBSheetPayment
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.31}
              >
                <PaymentInfoBox />
              </RBSheet>
              <RBSheet
                ref={refRBSheetReview} // 添加了一个新的RBSheet
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.33}
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
              {/*{existDriverInfo && <DriverInfoBox showBack={existDriverInfo}/>}*/}
              <RBSheet
                ref={refRBSheetPayment}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.31} // 设置RBSheet占据50%的屏幕高度
              >
                <PaymentInfoBox />
              </RBSheet>
            </ScrollView>
          </SafeAreaView>
        );
      case OrderStateEnum.COMPLETED:
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.fullScreen}>
              <OrderInfoBox showStatus={true} />
              {/*{existDriverInfo && <DriverInfoBox showBack={true} status={Status}/>}*/}
              <RBSheet
                ref={refRBSheetPayment}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={Dimensions.get("window").height * 0.31} // 设置RBSheet占据50%的屏幕高度
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
      </View>
    </NativeBaseProvider>
  );
};

export default UserOrderDetailScreen;
