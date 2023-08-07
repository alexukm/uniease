import React, { useEffect, useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
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
import { resetUserToken } from "../com/evotech/common/appUser/UserConstant";

const Header = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>&lt; Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const EditProfile = () => {
  const navigation = useNavigation();
  const profile = {
    firstName: "firstName",
    lastName: "lastName",
    avatar: require("../picture/avatar.jpg"),
  };
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [avatar, setAvatar] = useState(profile.avatar);
  useEffect(() => {
    const fillUserInfo = async () => {
      const userInfo = await getUserInfoWithLocal();
      if (userInfo) {
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
      }
    };
    fillUserInfo().then();
  }, []);
  const handleSubmit = async ({ firstName, lastName }) => {
    const params = {
      firstName: firstName,
      lastName: lastName,
    };

    const userInfo = await getUserInfoWithLocal();
    if (userInfo.isDriver()) {
      driverModifyUserInfo(params).then(data => {
        handleResponse(data, firstName, lastName, () => {
          navigation.replace("DriverAccount");
        });
      });
    } else if (userInfo.isUser()) {
      userModifyUserInfo(params).then(data => {
        handleResponse(data, firstName, lastName, () => {
          navigation.replace("UserAccount");
        });
      });
    }
  };

  const handleResponse = (data, firstName, lastName, navigationOp) => {
    responseOperation(data.code, () => {
      resetUserToken(data.data, firstName, lastName).then(() => {
        navigationOp();
      });
    }, () => {
      // TODO: 修改失败
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

    await launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const selectedImageUri = response.assets[0].uri;
        console.log("Selected Image URI:", selectedImageUri);
        const params = {
          userPhone: userInfo.userPhone,
        };
        const header = defaultHeaders.getAuthentication(userInfo.token);
        let uploadResponse;
        if (userInfo.isDriver()) {
          uploadResponse = await driverUploadAvatar(selectedImageUri, params, { headers: header });
        } else if (userInfo.isUser()) {
          uploadResponse = await userUploadAvatar(selectedImageUri, params, { headers: header });
        }

        responseOperation(uploadResponse.code, () => {
          setAvatar({ uri: selectedImageUri });  // 上传成功后在本地设置新的头像
        }, () => {
          console.error("Failed to upload avatar.");
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" />
      <Image
        style={styles.halfBackgroundImage}
        source={require("../picture/acc_bg.png")}
      />
      <View style={styles.avatarContainer}>
        <Image
          style={styles.avatar}
          source={avatar}  // 使用state中的avatar
        />
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 50,
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
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
