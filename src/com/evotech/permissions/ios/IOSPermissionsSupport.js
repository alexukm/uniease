import Geolocation from '@react-native-community/geolocation'
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';


//获取定位权限
export const iosLocationPermission = (granted, denied, err) => {
    Geolocation.requestAuthorization();
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
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

export const iosPhotoLibraryPermission =  (granted, denied, err) => {
    check(PERMISSIONS.IOS.PHOTO_LIBRARY)
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

