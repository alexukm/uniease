import React, { useEffect } from "react";
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Box, AspectRatio, Button, Center, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { UserChat, initLocalChat } from "../com/evotech/common/redux/UserChat";
import { queryDriverOrderStatus } from "../com/evotech/common/http/BizHttpUtil";
import { showDialog } from "../com/evotech/common/alert/toastHelper";
import { setUserToken, userType } from "../com/evotech/common/appUser/UserConstant";
import { buildUserInfo, getUserInfo, getUserInfoWithLocal } from "../com/evotech/common/appUser/UserInfo";
import { ALERT_TYPE } from "react-native-alert-notification";
import { DriverLoginStatusEnum, ImagesEnum } from "../com/evotech/common/constant/BizEnums";


const DriverHomeScreen = () => {
  const navigation = useNavigation();
  const initOrderStatusList = (initOrderStatusAfter) => {
    queryDriverOrderStatus().then((data) => {
      if (data.code === 200) {
        //订单状态集
        return data.data;
      }
    }).then((orderStatusList) => {
      initOrderStatusAfter(orderStatusList);
    });
  };

  const initChat = (orderStatusList) => {
    if (orderStatusList.pending || orderStatusList.inTransit) {
      UserChat(true).then();
    }
  };

  // const MyContext = createContext();
  useEffect(() => {
    setTimeout(async () => {
      await initLocalChat();
      initOrderStatusList(initChat);
    }, 0);
  }, []);

  const handlePress = (screen) => {
    navigation.navigate(screen);
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
    <SafeAreaView style={{flex: 1}}>
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
      <View style={{
        width: "100%",
        height: 90,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 20,
      }}>
        <Image source={{ uri: ImagesEnum.Logo }}
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
        <TouchableOpacity onPress={() => handlePress("DriverOrderListScreen")} style={{ width: "47%" }}>
          <Box>
            <CardWithoutDescription
              imageUri={ImagesEnum.DriverRide} />
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

export default DriverHomeScreen;
