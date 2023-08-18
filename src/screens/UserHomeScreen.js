import React, { useEffect } from "react";
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Box } from "native-base";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { initLocalChat } from "../com/evotech/common/redux/UserChat";
import { showDialog } from "../com/evotech/common/alert/toastHelper";
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
        shadowRadius: 4.84,
        elevation: 5,
      }}
    >
      <Image source={imageUri} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
     {/* <AspectRatio w="100%" ratio={16 / 9}>
        <Image source={imageUri} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
      </AspectRatio>*/}
    </Box>
  );
  const CardWithoutDescription = ({ imageUri }) => (
    <Box
      rounded="lg"
      overflow="hidden"
      borderColor="coolGray.200"
      borderWidth="1"
      backgroundColor="gray.50"
      style={{ aspectRatio: 2/3, width: '100%' }}
    >
      <Image source={imageUri} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
    </Box>
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
              <Card imageUri={require('../picture/userShare.png')} />
            </Box>
            <Box>
              <Card
                imageUri={require('../picture/userAd.png')} />
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
             {/* <Box
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                backgroundColor="gray.50"
                style={{ aspectRatio: 2/3, width: '100%' }}
              >
                <Image source={require('../picture/UserRide.png')} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              </Box>*/}
              <CardWithoutDescription
                imageUri={require('../picture/UserRide.png')} />
            </Box>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showDialog("WARNING", "Action Waiting", "Other features will be available soon, please wait")}
            style={{ width: "47%" }}>
            <Box>
             {/* <Box
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                backgroundColor="gray.50"
                style={{ aspectRatio: 2/3, width: '100%' }}
              >
                <Image source={require('../picture/UserService.png')} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              </Box>*/}
              <CardWithoutDescription
                imageUri={require('../picture/UserService.png')} />
            </Box>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


export default UserHome;
