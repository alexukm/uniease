import Geolocation from '@react-native-community/geolocation'
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';


//获取定位权限
export const iosLocationPermission = (granted, denied, err) => {
    Geolocation.requestAuthorization();
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
};

// export const iosLocationPermission = () => {
//   check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
//     .then((result) => {
//       switch (result) {
//         case RESULTS.GRANTED:
//           console.log('The permission is granted');
//           break;
//         case RESULTS.DENIED:
//           console.log('The permission has not been requested / is denied but requestable');
//           requestPermission(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//           break;
//         case RESULTS.BLOCKED:
//           console.log('The permission is denied and not requestable anymore');
//           Alert.alert(
//             'Permission Required',
//             'This feature requires access to your location. Please, go to settings and enable it.',
//             [
//               {text: 'Open Settings', onPress: () => openSettings().catch(() => console.warn('Cannot open settings'))},
//               {text: 'Cancel', onPress: () => {}, style: 'cancel'},
//             ]
//           );
//           break;
//       }
//     })
//     .catch((error) => {
//       console.log('An error occurred while checking permission: ', error);
//     });
// };
//
// const requestPermission = (permission) => {
//   request(permission).then((result) => {
//     if (result === RESULTS.GRANTED) {
//       console.log('The permission is granted');
//     } else {
//       console.log('The permission is not granted');
//     }
//   });
// };
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

