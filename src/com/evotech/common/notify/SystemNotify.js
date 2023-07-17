import { isAndroid, isIOS } from "../system/OSUtils";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import {iosNotifyPermission} from "../../permissions/ios/IOSPermissionsSupport";

const orderNotifyChannelId = "Order-Notify-Channel";
const orderNotifyChannelName = "Order-Channel";
const orderNotifyChannelDesc = "Channel to order information";

export const enableSystemNotify = () => {
  if (isAndroid()) {
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
          id: orderChannelId(),
          title: "body.noticeTitle",
          body:  "body.noticeContent",
      });
  }
};


export const orderChannelId = () => {
  return orderNotifyChannelId;
};
