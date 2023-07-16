import { isAndroid, isIOS } from "../system/OSUtils";
import PushNotification from "react-native-push-notification";

const orderNotifyChannelId = "Order-Notify-Channel";
const orderNotifyChannelName = "Order-Channel";
const orderNotifyChannelDesc = "Channel to order information";

export const enableSystemNotify = (PushNotification) => {
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
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification);
      },
      requestPermissions: true,
    });
  }
};


export const notifyOrderChannel = (PushNotification,body) => {
  if (isAndroid()) {
    PushNotification.localNotification({
      channelId: orderChannelId(),
      title: body.noticeTitle, // 通知的标题
      message: body.noticeContent, // 通知的消息文本
    });
  }
  if (isIOS()) {
    PushNotification.localNotification({
      title: body.noticeTitle, // 通知的标题
      message: body.noticeContent, // 通知的消息文本
    });
  }
};


export const orderChannelId = () => {
  return orderNotifyChannelId;
};
