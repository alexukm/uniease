import React from "react";
import { Composer, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, selectChatMessage } from "../com/evotech/common/redux/chatSlice";
import uuid from "react-native-uuid";
import { UserChat } from "../com/evotech/common/redux/UserChat";
import {
  checkClientStatus,
   existSocketClient, retrySocketConn,
  whenConnect,
} from "../com/evotech/common/websocket/SingletonWebSocketClient";
import { SafeAreaView } from "react-native";

export default function ChatRoom({ route }) {
  const { receiverName, receiverUserCode, orderId, receiverOrderId } = route.params;
  const dispatch = useDispatch();

  const messages = useSelector(selectChatMessage);

  const sleep = async (timeout)=>{
    return await new Promise(resolve => setTimeout(resolve, timeout));
  }

  async function onSend(newMessages = []) {
    try {
      const param = {
        receiverName: receiverName,
        receiverOrderId: receiverOrderId,
        receiverUserCode: receiverUserCode,
        message: newMessages[0].text,
        requestTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };

      const message = {
        _id: uuid.v4(),
        userCode: receiverUserCode,
        text: newMessages[0].text,
        orderId: orderId,
        createdAt: param.requestTime,
        user: {
          _id: 1,
          name: receiverName,
        },
      };
      //不存在 则是第一次进入
      if (!existSocketClient()) {
        await UserChat(true).then();
        await sleep(700).then()
      }else {
        // 连接被异常关闭 或 未连接
        if (checkClientStatus()) {
          //尝试重新连接
          await retrySocketConn();
          await sleep(1000).then()
          if (checkClientStatus()) {
            alert("Send failed,Please try again!");
            return;
          }
        }
      }

      await whenConnect((socketClient) => {
        socketClient.publish({ destination: "/uniEase/v1/order/chat/ride", body: JSON.stringify(param) });
      });
      dispatch(addMessage(message));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between", paddingBottom: 30 }}>
      <GiftedChat
        messages={messages[orderId] || []}
        onSend={newMessages => onSend(newMessages)}
        user={{ _id: 1 }}
        renderInputToolbar={(props) => (
          <InputToolbar {...props}
                        renderComposer={(composerProps) => (
                          <Composer
                            {...composerProps}
                            textInputStyle={{
                              ...composerProps.textInputStyle,
                              color: "black",
                            }} // 这里设置输入框文字颜色为黑色
                          />
                        )}
          />
        )}
      />
    </SafeAreaView>
  );
}

