import {Platform} from "react-native";
import DeviceInfo from "react-native-device-info";

export let deviceId;

export  const setDeviceId = async () =>{
    deviceId = await DeviceInfo.getUniqueId();
}

export const isIOS = ()=>{
    return Platform.OS === 'ios'
}
export const isAndroid = ()=>{
    return Platform.OS === 'android'
}
