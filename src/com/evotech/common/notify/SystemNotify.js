import { isAndroid, isIOS } from "../system/OSUtils";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import { iosNotifyPermission } from "../../permissions/ios/IOSPermissionsSupport";
import messaging from "@react-native-firebase/messaging";
import { syncUserFirebaseToken } from "../http/BizHttpUtil";
import { getUserInfoWithLocal } from "../appUser/UserInfo";
import { UserTypeEnum } from "../constant/BizEnums";
import { responseOperation } from "../http/ResponseOperation";

const orderNotifyChannelId = "Order-Notify-Channel";
const orderNotifyChannelName = "Order-Channel";
const orderNotifyChannelDesc = "Channel to order information";

export const enableSystemNotify = async () => {
  /*if (isAndroid()) {
    PushNotification.createChannel(
      {
        channelId: orderNotifyChannelId, // channel id
        channelName: orderNotifyChannelName, // channel name
        channelDescription: orderNotifyChannelDesc, // channel description
        soundName: "default", // Makes the default notification sound
        importance: 4, // set the importance of notifications
        vibrate: true, // sets whether notifications posted to this channel trigger vibration
      },
      (created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }

  if (isIOS()) {
    iosNotifyPermission();
  }*/
  const userInfo = await getUserInfoWithLocal();
  if (userInfo) {
    const userType = userInfo.isUser() ? UserTypeEnum.PASSER : userInfo.isDriver() ? UserTypeEnum.DRIVER : "";
    messaging()
      .requestPermission()
      .then(authStatus => {
        console.log("APNs Status: ", authStatus);
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          messaging()
            .getToken()
            .then(token => {
              //将Token 同步给后台
              const params = {
                fireBaseToken: encodeURIComponent(token),
                userType: userType,
              };
              console.log("sync token: ", params);
              syncUserFirebaseToken(params).then(data => {
                responseOperation(data.code,()=>{
                  messaging().onMessage(async remoteMessage => {
                    console.log("onMessage",remoteMessage);
                    notifyOrderChannel({
                      noticeTitle: remoteMessage.notification.title,
                      noticeContent: remoteMessage.notification.body,
                    });
                  });
                  messaging().onTokenRefresh(token => {
                    const params = {
                      fireBaseToken: encodeURIComponent(token),
                      userType: userType,
                    };
                    syncUserFirebaseToken(params).then();
                  });
                  messaging().setBackgroundMessageHandler(async remoteMessage => {
                    console.log("setBackgroundMessageHandler",remoteMessage);
                    notifyOrderChannel({
                      noticeTitle: remoteMessage.data.title,
                      noticeContent: remoteMessage.data.body,
                    });
                  });
                  messaging().onNotificationOpenedApp(remoteMessage => {
                    console.log("Message received in background:", remoteMessage);
                    notifyOrderChannel({
                      noticeTitle: remoteMessage.data.title,
                      noticeContent: remoteMessage.data.body,
                    });
                  });
                  // 处理应用关闭的消息
                  messaging().getInitialNotification().then(remoteMessage => {
                    if (remoteMessage) {
                      console.log("Message received while app was quit:", remoteMessage);
                      notifyOrderChannel({
                        noticeTitle: remoteMessage.data.title,
                        noticeContent: remoteMessage.data.body,
                      });
                    }
                  });
                },()=>{

                })
                },
              );
              console.log("messaging.getToken: ", token);
            }).catch(err => {
            console.log("messaging.requestPermission Error: ", err);
          });
        }
      });
  }
};


export const notifyOrderChannel = (body) => {
  if (isAndroid()) {
    PushNotification.localNotification({
      channelId: orderChannelId(),
      title: body.noticeTitle, // 通知的标题
      message: body.noticeContent, // 通知的消息文本
    });
  }
  if (isIOS()) {
    PushNotificationIOS.addNotificationRequest({
      id: "order notify",
      title: body.noticeTitle,
      body: body.noticeContent,
    });
  }
};


export const orderChannelId = () => {
  return orderNotifyChannelId;
};
