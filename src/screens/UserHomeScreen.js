import React, { useEffect } from "react";
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Box, AspectRatio } from "native-base";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { initLocalChat } from "../com/evotech/common/redux/UserChat";
import { showDialog } from "../com/evotech/common/alert/toastHelper";
import { ImagesEnum, LocalImageFileEnum } from "../com/evotech/common/constant/BizEnums";
import { enableSystemNotify } from "../com/evotech/common/notify/SystemNotify";

const UserHome = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      enableSystemNotify().then();
      initLocalChat().then();
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
        <Image source={{uri: imageUri}} style={{ flex: 1 }} />
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
          <Image source={require("../picture/logo.png")} style={{ width: 100, height: 100 }} />
        </View>

        <View style={{ height: "40%", width: "100%" }}>
          <Swiper showsButtons={false}>
            <Box>
              <Card imageUri={LocalImageFileEnum.SWA} />
            </Box>
            <Box>
              <Card
                imageUri={LocalImageFileEnum.UserAD} />
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
                imageUri={LocalImageFileEnum.UserRide} />
            </Box>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showDialog("WARNING", "Action Waiting", "Other features will be available soon, please wait")}
            style={{ width: "47%" }}>
            <Box>
              <CardWithoutDescription
                imageUri={LocalImageFileEnum.UserService} />
            </Box>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


export default UserHome;
