import { asyncDelKey, getValue, setKeyValue } from "./LocalStorageUtil";
import { defaultHeaders } from "../http/HttpUtil";
import { buildUserInfo, getUserInfoWithLocal, removeUserInfo } from "./UserInfo";
import { closeWebsocket } from "../websocket/SingletonWebSocketClient";
import { clearLocalChat } from "../redux/UserChat";
import { deviceId, isAndroid, isIOS } from "../system/OSUtils";
import * as RNFS from "react-native-fs";
import { Image } from "react-native";
import {  getServerRequestUrlPrefix } from "../env/Server";


export const LOCAL_FILE_PATH = RNFS.DocumentDirectoryPath + "/uniease";
export const LOCAL_USER_INFO_FILE_PATH = LOCAL_FILE_PATH + "/user_info";

export const USER_AVATAR_FILE_NAME = "avatar.image";
export const UserOrigin = { APP: 0 };
export const UserPlatform = { Android: 1, IOS: 2 };

export const userType = { USER: 0, DRIVER: 1 };

export const CarType = {
  Sedan: { desc: "Sedan", value: 0 },
  SUV: { desc: "Sport Utility Vehicle (SUV)", value: 1 },
  Coupe: { desc: "Coupe", value: 2 },
  MPV: { desc: "Multi-Purpose Vehicle (MPV)", value: 3 },
  Pickup_Truck: { desc: "Pickup Truck", value: 4 },
};

export const DriverImageType = {
  //自拍
  Selfie: 0,
  //车保信息
  Vehicle_Insurance: 1,
  //身份证 正面
  NRIC_FRONT: 2,
  //身份证 反面
  NRIC_BACK: 3,
  //护照
  Passport: 4,
  //驾照
  License: 5,
  Car_Path: 6,
};

export function getUserID() {
  return deviceId;
}

export function getUserType() {
  return 0;
}

export function setUserToken(token) {
  setKeyValue(defaultHeaders.TOKEN, token).then();
}

export function removeUserToken() {
  asyncDelKey(defaultHeaders.TOKEN).then();
}

export function userLogOut() {
  //删除用户头像
  unLinkUserAvatar().then();
  //删除token
  asyncDelKey(defaultHeaders.TOKEN).then();
  //删除用户信息
  removeUserInfo();
  //close websocket
  closeWebsocket();
  // clear chat room
  clearLocalChat().then();
}

export async function getUserToken() {
  return await getValue(defaultHeaders.TOKEN);
}


export async function setChatMessages(messages) {
  const userInfo = await getUserInfoWithLocal();
  setKeyValue("@chatMessages:" + userInfo.userPhone, JSON.stringify(messages)).then();
}

export async function setChatList(chatList) {
  const userInfo = await getUserInfoWithLocal();
  setKeyValue("@chatList:" + userInfo.userPhone, JSON.stringify(chatList)).then();
}

export async function getChatMessages() {
  const userInfo = await getUserInfoWithLocal();
  return getValue("@chatMessages:" + userInfo.userPhone).then(data => {
    return data ? JSON.parse(data) : null;
  });
}


export async function delChatMessages() {
  const userInfo = await getUserInfoWithLocal();
  return asyncDelKey("@chatMessages:" + userInfo.userPhone);
}

export async function resetUserToken(token, firstName, lastName) {
  setUserToken(token);
  const userInfo = await getUserInfoWithLocal();
  if (userInfo) {
    buildUserInfo(token, userInfo.userType, userInfo.userPhone, userInfo.loginStatus, firstName, lastName).saveWithLocal();
  }

}

//保存image到本地
export async function saveLocalImage(imageUrl, fileName) {
  const userInfo = await getUserInfoWithLocal();
  const userInfoPath = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/`;
  const path = `${userInfoPath}${fileName}`;
  const options = {
    fromUrl: imageUrl,
    toFile: path,
  };

  const existFile = await RNFS.exists(path);
  if (existFile) {
    await RNFS.unlink(path);
  } else {
    await RNFS.mkdir(userInfoPath).then();
  }
  await RNFS.downloadFile(options).promise
    .then(() => {
      console.log("Image saved to", path);
    })
    .catch(error => {
      console.error("Failed to save image:", error);
    });
}

export async function createUserInfoDirectory() {
  const userInfo = await getUserInfoWithLocal();
  const path = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/`;
  await RNFS.mkdir(path);
}

export async function copyUserAvatarLocal(sourceUri, fileName) {
  const userInfo = await getUserInfoWithLocal();
  const path = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/${fileName}`;
  try {
    const exist = await RNFS.exists(path);
    if (exist) {
      await RNFS.unlink(path);
    }
    await RNFS.copyFile(sourceUri, path);
    console.log(`Image saved at ${path}`);
  } catch (error) {
    console.error("Error saving the image to local storage:", error);
  }
  return path;
}

// 获取image在本地的路径
export async function userLocalImagePath(fileName) {
  const userInfo = await getUserInfoWithLocal();
  const localFileName = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/${fileName}`;
  return await RNFS.exists(localFileName).then(data => {
    if (data) {
      return "file://" + localFileName + "?time=" + new Date().getTime();
    } else {
      if (isAndroid()) {
        return "asset:/avatar.jpg";
      } else {
        return "file://" + localFileName + "?time=" + new Date().getTime();
      }
    }
  });
}

export const unLinkUserAvatar = async () => {
  const userInfo = await getUserInfoWithLocal();
  const localAvatarPath = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/${USER_AVATAR_FILE_NAME}`;
  const exist = await RNFS.exists(localAvatarPath);
  if (exist) {
    return await RNFS.unlink(localAvatarPath).then();
  }
};

export const saveUserAvatar = async (userPhone, data) => {
  // 存在自定义头像
  if (data && data.userAvatarPath) {
    const imageUrl = `${getServerRequestUrlPrefix()}/uniEaseApp/pia/avatar/${userPhone}/${data.userAvatarPath}`;
    saveLocalImage(imageUrl, USER_AVATAR_FILE_NAME).then();
  } else {
    if (isIOS()) {
      const userInfo = await getUserInfoWithLocal();
      const assetPath = Image.resolveAssetSource(require("../../../../picture/avatar.jpg"));
      const destinationPath = `${LOCAL_USER_INFO_FILE_PATH}/${userInfo.userPhone}/${USER_AVATAR_FILE_NAME}`;
      const options = {
        fromUrl: assetPath.uri,
        toFile: destinationPath,
      };
      await RNFS.downloadFile(options).promise
        .then(() => {
          console.log("Image saved to", destinationPath);
        })
        .catch(error => {
          console.error("Failed to save image:", error);
        });
    }
  }
};
