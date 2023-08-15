import React, {  useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import { driverLogout } from "../com/evotech/common/http/BizHttpUtil";
import { USER_AVATAR_FILE_NAME, userLocalImagePath, userLogOut } from "../com/evotech/common/appUser/UserConstant";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { showDialog } from "../com/evotech/common/alert/toastHelper";
import { getUserInfoWithLocal } from "../com/evotech/common/appUser/UserInfo";
import { LocalImageFileEnum } from "../com/evotech/common/constant/BizEnums";


const DriverAccount = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [avatarURI, setAvatarURI] = useState(LocalImageFileEnum.Avatar);

  useFocusEffect(
    React.useCallback(() => {
      userLocalImagePath(USER_AVATAR_FILE_NAME).then((fileName) => {
        setAvatarURI("file://" + fileName + "?time=" + new Date().getTime());
      });
    const fillUserInfo = async () => {
      const userInfo = await getUserInfoWithLocal();
      if (userInfo) {
        let formattedUserName = userInfo.userName.toUpperCase();
        if (formattedUserName.length > 18) {
          formattedUserName = formattedUserName.slice(0, 18) + '...';
        }
        setUserName(formattedUserName);
      }
    };
      fillUserInfo().then();
    }, []),
  );


  // Define handlers
  const handleWalletPress = () => {
    showDialog("WARNING", "Notice", "We are still working on the e-wallet feature. Please wait for the next version update.");
  };


  const handleSharePress = () => {
    Linking.openURL("https://unieaseapp.com/unieaseapp/").then();
  };

  // const handleCustomerServicePress = () => {
  //   navigation.navigate("ChatRoom", {
  //     receiverName: "Customer Service",
  //     receiverUserCode: "user202307150002",
  //     orderStatus: "Pending",
  //     needQueryOrderStatus: false,
  //     orderId: "user202307150002",
  //     receiverOrderId: "user202307150002",
  //   });
  // };


  const handlePricingRulesPress = () => {
    Linking.openURL("https://unieaseapp.com/unieaseConditions/").then();
  };

  const deleteAccountPress = () => {
    navigation.navigate("DeleteAccount")
  };

  const handleAvatarPress = () => {
    navigation.navigate("EditProfile");
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            // Handle logout click event
            await driverLogout();
            userLogOut();
            navigation.replace("DriverLogin");
          },
        },
      ],
      { cancelable: false },
    );
  };

  const options = [
    { name: "Wallet", onPress: handleWalletPress },
    { name: "Share", onPress: handleSharePress },
    // { name: "Customer Service", onPress: handleCustomerServicePress },
    { name: "Pricing Rules", onPress: handlePricingRulesPress },
    { name: "Delete Account", onPress: deleteAccountPress },
    { name: "Logout", onPress: handleLogoutPress },
  ];

  return (
    <>
      <ImageBackground source={require("../picture/acc_bg.png")} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleAvatarPress}>
            {/*{avatarURI ? <Image source={{ uri: avatarURI }} style={styles.avatar} /> : null}*/}
            <Image source={{ uri: avatarURI }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <View style={styles.curveMask} />
      </ImageBackground>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={option.onPress}>
            <Text style={styles.optionText}>{option.name}</Text>
            <RemixIcon name="arrow-right-s-line" size={25} color="#000" />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  optionsContainer: {
    flex: 2,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 14,
    color: '#000000', // Add this line
  },
  curveMask: {
    position: "absolute",
    bottom: 0,
    width: Dimensions.get("window").width,
    height: 30,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default DriverAccount;
