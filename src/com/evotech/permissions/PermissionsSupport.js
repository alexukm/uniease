import {Platform} from "react-native";
import {iosLocationPermission, iosPhotoLibraryPermission} from "./ios/IOSPermissionsSupport";
import {
    androidCameraPermission,
    androidLocationPermission,
    androidPhotoLibraryPermission,
} from "./android/AndroidPermissionsSupport";

export const checkPhotoLibraryPermission = (granted, denied, err) => {
    if (Platform.OS === 'ios') {
        return iosPhotoLibraryPermission(granted, denied, err);
    }
    if (Platform.OS === 'android') {
        return androidCameraPermission(granted, denied, err);
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
