import React, { useEffect, useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import {
  driverModifyUserInfo,
  driverUploadAvatar,
  userModifyUserInfo,
  userUploadAvatar,
} from "../com/evotech/common/http/BizHttpUtil";
import { defaultHeaders } from "../com/evotech/common/http/HttpUtil";
import { getUserInfoWithLocal } from "../com/evotech/common/appUser/UserInfo";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import {
  copyUserAvatarLocal, getUserToken,
  resetUserToken,
  saveLocalImage,
  USER_AVATAR_FILE_NAME,
  userLocalImagePath,
} from "../com/evotech/common/appUser/UserConstant";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import * as RNFS from "react-native-fs";



const EditProfile = () => {
  const navigation = useNavigation();
  const profile = {
    firstName: "firstName",
    lastName: "lastName",
  };
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [avatar, setAvatar] = useState("");
  const [userInfo, setUserInfo] = useState();
  useEffect(() => {
    const fillUserInfo = async () => {
      const userInfo = await getUserInfoWithLocal();
      if (userInfo) {
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
        setUserInfo(userInfo)
      }
    };
    userLocalImagePath(USER_AVATAR_FILE_NAME).then((fileName) => {
      setAvatar("file://" + fileName+'?time=' + new Date().getTime() );
    });
    fillUserInfo().then();
  }, []);
  const handleSubmit = async ({ firstName, lastName }) => {
    if (userInfo && firstName === userInfo.firstName && lastName === userInfo.lastName) {
      showToast("WARNING", "No info changed", "No changes detected. Please update your information before saving.");
      return; // Return early to stop further execution
    }
    const params = {
      firstName: firstName,
      lastName: lastName,
    };

    // 注意：这里我们不再重新声明 userInfo
    if (userInfo.isDriver()) {
      driverModifyUserInfo(params).then(data => {
        handleResponse(data, firstName, lastName, () => {
          navigation.navigate("DriverAccount");
        });
      });
    } else if (userInfo.isUser()) {
      userModifyUserInfo(params).then(data => {
        handleResponse(data, firstName, lastName, () => {
          navigation.navigate("AccountScreen");
        });
      });
    }
  };


  const navigationSkip= ()=>{
    if (userInfo) {
      if (userInfo.isUser()) {
        navigation.navigate("AccountScreen");
      }else if (userInfo.isDriver()) {
        navigation.navigate("DriverAccount");
      } else {
        navigation.goBack();
      }
    }
  }
  const handleResponse = (data, firstName, lastName, navigationOp) => {
    responseOperation(data.code, () => {
      resetUserToken(data.data, firstName, lastName).then(() => {
        showToast("SUCCESS", "Update Successful", "User information has been updated successfully."); // Show success toast
        navigationOp();
      });
    }, () => {
      // TODO: 修改失败
      showToast("WARNING", "Update Failed", "Failed to update user information.");
      console.error("Failed to update user information.");
    });
  };

  // 图库选择和上传的函数
  const changeAvatar = async () => {
    const options = {
      quality: 1.0,
      mediaType: "photo",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    const userInfo = await getUserInfoWithLocal();
    const userToken = await getUserToken();
    await launchImageLibrary(options, async response => {
      if (response.didCancel) {
        showToast("WARNING", "Image Picker", "User cancelled image picker");
      } else if (response.error) {
        showToast("WARNING", "ImagePicker Error", response.error);
      } else {
        const selectedImageUri = response.assets[0].uri;
        const params = {
          userPhone: userInfo.userPhone,
        };
        const exist = await RNFS.exists(selectedImageUri);

        if (!exist) {
          showToast("WARNING", "Image Not Found", "Selected image not found");
          return;
        }
        const header = defaultHeaders.getAuthentication(userToken);
        let uploadResponse;
        if (userInfo.isDriver()) {
          uploadResponse = await driverUploadAvatar(selectedImageUri, params, { headers: header });
        } else if (userInfo.isUser()) {
          uploadResponse = await userUploadAvatar(selectedImageUri, params, { headers: header });
        }

        responseOperation(uploadResponse.code, () => {
          showToast("SUCCESS", "Upload Successful", "Avatar uploaded successfully.");
          copyUserAvatarLocal(selectedImageUri, USER_AVATAR_FILE_NAME).then(data=>{
            setAvatar("file://" + data+'?time=' + new Date().getTime() );
          });
           // 上传成功后在本地设置新的头像
        }, () => {
          showToast("WARNING", "Upload Failed", "Failed to upload avatar.");
          console.error("Failed to upload avatar.");
        });
      }
    });
  };

  const Header = ({ title }) => {

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigationSkip()
        }} style={styles.backButton}>
          <Text style={styles.backButtonText}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <Header title="Edit Profile" />
      <Image
        style={styles.halfBackgroundImage}
        source={require("../picture/acc_bg.png")}
      />
      <View style={styles.avatarContainer}>
        {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : null}
        <TouchableOpacity style={styles.changeAvatarButton} onPress={changeAvatar}>
          <Text style={styles.changeAvatarButtonText}>Change Avatar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleSubmit({ firstName, lastName })}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  halfBackgroundImage: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 120,
    resizeMode: "cover",
    zIndex: 0,
  },
  form: {
    width: "90%",
  },
  label: {
    marginTop: 20,
    fontSize: 14,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#0055A4",
    borderRadius: 5,
    height: 50,
    width: "90%",
    justifyContent: 'center', // 垂直居中
    alignItems: 'center',     // 水平居中
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    // textAlign: "center",
  },
  avatarContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarButtonText: {
    color: "#1E90FF",
    fontSize: 14,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButtonContainer: {
    position: "absolute",
    width: "100%",
    bottom: 20,
    alignItems: "center",
  },
});

export default EditProfile;
