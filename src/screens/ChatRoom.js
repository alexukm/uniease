import React, { useEffect, useState } from "react";
import { Composer, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { addChatList, addMessage, selectChatMessage } from "../com/evotech/common/redux/chatSlice";
import uuid from "react-native-uuid";
import { UserChat } from "../com/evotech/common/redux/UserChat";
import {
  clientStatus,
  whenConnect,
} from "../com/evotech/common/websocket/SingletonWebSocketClient";
import { SafeAreaView } from "react-native";
import { OrderStateEnum } from "../com/evotech/common/constant/BizEnums";
import { getUserInfoWithLocal } from "../com/evotech/common/appUser/UserInfo";
import { queryDriverOrderStatusByOrderId, queryUserOrderStatusByOrderId } from "../com/evotech/common/http/BizHttpUtil";

export default function ChatRoom({ route }) {
  const { receiverName, receiverUserCode, orderStatus, orderId, receiverOrderId, needQueryOrderStatus } = route.params;
  const dispatch = useDispatch();
  // const showChatInput = orderStatus === OrderStateEnum.PENDING || OrderStateEnum.IN_TRANSIT === orderStatus;
  const messages = useSelector(selectChatMessage);
  const [chatStatus, setChatStatus] = useState(true);
  const initChatClient = async () => {
    await UserChat(false);
  };
  useEffect( () => {
    // 从聊天详情页进入时 需要查询  从订单详情进入时不需要查询
    setTimeout(async () => {
      if (needQueryOrderStatus) {
        //查询订单最新状态
        const userInfo = await getUserInfoWithLocal();
        let orderStatus = "";
        if (userInfo.isUser()) {
          orderStatus = (await queryUserOrderStatusByOrderId(orderId)).data;
        } else if (userInfo.isDriver()) {
          orderStatus = (await queryDriverOrderStatusByOrderId(orderId)).data;
        }
        const allowChat = orderStatus === OrderStateEnum.PENDING || OrderStateEnum.IN_TRANSIT === orderStatus;
        setChatStatus(allowChat);
      }
    }, 0);
    initChatClient().then();
  }, []);

  async function onSend(newMessages = []) {

    if (!chatStatus) {
      alert("Order completed, unable to send messages.");
      return;
    }

    try {
      const param = {
        receiverName: receiverName,
        receiverUserCode: receiverUserCode,
        receiverOrderId: receiverOrderId,
        senderOrderId: orderId,
        message: newMessages[0].text,
        requestTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
      const message = {
        _id: uuid.v4(),
        userCode: receiverUserCode,
        orderId: orderId,
        text: newMessages[0].text,
        orderStatus: orderStatus,
        createdAt: param.requestTime,
        user: {
          _id: 1,
          name: receiverName,
        },
      };
      const chatList = {
        id: uuid.v4(),
        title: receiverName,
        message: message.text,
        userCode: receiverUserCode,
        time: param.requestTime,
        orderId: orderId,
        receiverOrderId: receiverOrderId,
        createdAt: new Date().getTime(), // 获取当前时间，用来判断3天删除本地对话
        unread: "",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWgelHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      };
      // 连接被异常关闭
      if (!clientStatus()) {
        alert("Connection is not established,Please try again later");
        return;
      }
      await whenConnect((socketClient) => {
        socketClient.publish({ destination: "/uniEase/v1/order/chat/ride", body: JSON.stringify(param) });
      });
      dispatch(addMessage(message));
      dispatch(addChatList(chatList));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between", paddingBottom: 30 }}>
      <GiftedChat
        messages={messages[receiverUserCode] || []}
        onSend={newMessages => onSend(newMessages)}
        user={{ _id: 1 }}
        renderInputToolbar={(props) => (
          <InputToolbar {...props}
                        renderComposer={(composerProps) => (
                          <Composer
                            {...composerProps}
                            textInputStyle={{ ...composerProps.textInputStyle, color: "black" }} // 这里设置输入框文字颜色为黑色
                          />
                        )}
          />
        )}
      />
    </SafeAreaView>
  );
}

