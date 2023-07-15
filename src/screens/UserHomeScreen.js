import React, { useEffect } from "react";
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Box, AspectRatio, Button, Center, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { initLocalChat, UserChat } from "../com/evotech/common/redux/UserChat";
import { queryUserOrderStatus } from "../com/evotech/common/http/BizHttpUtil";
import { userOrderWebsocket } from "../com/evotech/common/websocket/UserChatWebsocket";
import { showDialog } from "../com/evotech/common/alert/toastHelper";
import { ImagesEnum } from "../com/evotech/common/constant/BizEnums";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";


const UserHome = () => {
  const navigation = useNavigation();
  //TODO 处理查询失败的情况

  const initChatSocket = (data) => {
    const orderStatus = data.data;
    //存在待接单的订单
    if (orderStatus.awaiting) {
      //订阅  订单接单通知
      setTimeout(async () => {
        await userOrderWebsocket((body)=>{}).then();
      }, 0);
    }
    return orderStatus;
  };
  const subscriptionOrderAccept = async (orderStatusInitAfter) => {
    await queryUserOrderStatus().then((data) => {
      return responseOperation(data.code,()=>{
        return  initChatSocket(data);
      },()=>{
        return data.data;
      })
    }).then(orderStatus => {
      if (orderStatus) {
        orderStatusInitAfter(orderStatus);
      }
    });
  };

  const initUserChat = (orderStatus) => {
    //在订单状态初始化之后执行
    initLocalChat().then(data => {
        //  本地存储聊天信息记录 且存在待出现和旅途中的订单 则初始化websocket聊天订阅
        if (orderStatus.pending || orderStatus.inTransit) {
          setTimeout(async () => {
            await UserChat(true).then();
          }, 0);
        }
      },
    );
  };

  useEffect(() => {
    setTimeout(() => {
      subscriptionOrderAccept(initUserChat).then();
    }, 0);
  }, []);

  const handlePress = (screen) => {
    if (screen === "RideOrderScreen") {
      navigation.navigate("Orders", { screen: "RideOrderScreen" });
    } else if (screen === "OrderDetailScreen") {
      navigation.navigate("Orders", { screen: "OrderDetailScreen" });
    } else {
      navigation.navigate(screen);
    }
  };

  const Card = ({ imageUri }) => (
    <Box
      bg="white"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <AspectRatio w="100%" ratio={16 / 9}>
        <Image source={{ uri: imageUri }} style={{ flex: 1 }} />
      </AspectRatio>
    </Box>
  );
  const CardWithoutDescription = ({ imageUri }) => (
    <View style={{ height: 200 }}>
      <Box
        rounded="lg"
        overflow="hidden"
        borderColor="coolGray.200"
        borderWidth="1"
        backgroundColor="gray.50"
      >
        <AspectRatio w="100%" ratio={2 / 3}>
          <Image source={{ uri: imageUri }} style={{ flex: 1 }} />
        </AspectRatio>
      </Box>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
        <View style={{
          width: "100%",
          height: 90,
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          paddingLeft: 20,
        }}>
          <Image source={require("../picture/logo.png")}
                 style={{ width: 100, height: 100 }} />
        </View>

        <View style={{ height: "40%", width: "100%" }}>
          <Swiper showsButtons={false}>
            <Box>
              <Card imageUri={ImagesEnum.UserShare} />
            </Box>
            <Box>
              <Card
                imageUri={ImagesEnum.UserUniversity} />
            </Box>
          </Swiper>
        </View>

        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 5,
          paddingHorizontal: 5,
        }}>
          <TouchableOpacity onPress={() => handlePress("RideOrderScreen")} style={{ width: "47%" }}>
            <Box>
              <CardWithoutDescription
                imageUri={ImagesEnum.UserRide} />
            </Box>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showDialog("WARNING", "Action Waiting", "Other features will be available soon, please wait")}
            style={{ width: "47%" }}>
            <Box>
              <CardWithoutDescription
                imageUri={ImagesEnum.UserService} />
            </Box>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


export default UserHome;
