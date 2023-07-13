import {Platform} from "react-native";
import {
    iosLocationPermission,
    iosPhotoLibraryPermission,
    iosRequestPhotoLibraryPermission
} from "./ios/IOSPermissionsSupport";
import {
    androidCameraPermission,
    androidLocationPermission,
} from "./android/AndroidPermissionsSupport";

export const checkPhotoLibraryPermission = (granted, denied, err) => {
    if (Platform.OS === 'ios') {
        return iosPhotoLibraryPermission(granted, denied, err);
    }
    if (Platform.OS === 'android') {
        return androidCameraPermission(granted, denied, err);
    }
}

// 只有ios平台需要请求相册权限
export const requestPhotoLibraryPermission = () =>{
    if (Platform.OS === 'ios') {
        iosRequestPhotoLibraryPermission()
    }
}

export const locationPermission = (granted, denied, err) => {
    if (Platform.OS === 'ios') {
        return iosLocationPermission(granted, denied, err);
    }
    if (Platform.OS === 'android') {
        return androidLocationPermission(granted, denied, err);
    }
}
