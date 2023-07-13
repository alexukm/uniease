import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from "@react-native-community/geolocation";
import {PermissionsAndroid} from "react-native";


export const androidLocationPermission = async (granted, denied, err) => {
    await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
        }
    ).then(result => {
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
            granted(result);
        } else {
            denied(result);
        }
    }).catch(error => {
        err(error);
    });
};


export const androidPhotoLibraryPermission = (granted, denied, err) => {
    check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
        .then((result) => {
            if (result === RESULTS.GRANTED) {
                granted(result);
            } else {
                denied(result);
            }
        })
        .catch((error) => {
            err(error);
        });
};

export const androidCameraPermission = async (granted, denied, err) => {
  try {
    const grantedPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Camera Permission",
        message: "This app needs access to your camera",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (grantedPermission === PermissionsAndroid.RESULTS.GRANTED) {
      granted(grantedPermission);
    } else {
      denied(grantedPermission);
    }
  } catch (error) {
    err(error);
  }
};
