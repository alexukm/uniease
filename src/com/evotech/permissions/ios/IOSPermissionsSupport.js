import Geolocation from '@react-native-community/geolocation'
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import PushNotificationIOS from "@react-native-community/push-notification-ios";

//获取定位权限
export const iosLocationPermission = (granted, denied, err) => {
  Geolocation.requestAuthorization();
  check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
    .then((result) => {
      if (result === RESULTS.GRANTED) {
        granted(result);
      } else {
        check(PERMISSIONS.IOS.LOCATION_ALWAYS)
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
      }
    })
    .catch((error) => {
      err(error);
    });
};

export const iosNotifyPermission = () =>{
    PushNotificationIOS.requestPermissions()
        .then(data => console.log(data))
        .catch(error => console.log(error));
}

export const iosRequestPhotoLibraryPermission  =  (granted, denied, err) => {
    request(PERMISSIONS.IOS.PHOTO_LIBRARY).then((result) => {
        if (result === RESULTS.GRANTED) {
            granted(result);
        } else {
            denied(result);
        }
    }).catch((error) => {
        err(error);
    });


}
export const iosPhotoLibraryPermission =  (granted, denied, err) => {
    check(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then((result) => {
            if (result === RESULTS.GRANTED) {
                granted(result);
            } else {
                denied(result);
            }
        }).catch((error) => {
            err(error);
        });
    /*
        if (result === RESULTS.UNAVAILABLE) {
            console.log('相册权限不可用');
        } else if (result === RESULTS.DENIED) {
            console.log('没有相册权限');
        } else if (result === RESULTS.GRANTED) {
            console.log('已经有相册权限');
        } else if (result === RESULTS.BLOCKED) {
            console.log('相册权限被拒绝');
        }*/
};

