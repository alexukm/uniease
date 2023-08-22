import { addMessage, clearChat, deleteChat,  initMessage } from "./chatSlice";
import uuid from "react-native-uuid";
import { userInitChatWebsocket } from "../websocket/UserChatWebsocket";
import store from "./store";
import {
  getChatMessages,
  setChatMessages,
} from "../appUser/UserConstant";
import { clientStatus } from "../websocket/SingletonWebSocketClient";


export const UserChat = async (needRetry) => {
  const dispatch = store.dispatch;
  console.log("UserChat UserChat");
  const buildChatMsg = (body) => {
    const receiveMsg = JSON.parse(body);
    const message = {
      _id: uuid.v4(),
      userCode: receiveMsg.senderUserCode,
      orderId: receiveMsg.orderId,
      text: receiveMsg.message,
      createdAt: receiveMsg.requestTime,
      user: {
        _id: receiveMsg.senderUserCode,
        name: receiveMsg.senderName,
      },
    };

    // 添加聊天信息
    dispatch(addMessage(message));
  };

  const onSubscribe = (body) => {
    buildChatMsg(body);
  };

  const onConnect = (chatWebsocket) => {
    chatWebsocket.subscribe("/user/topic/chat", "chat", (body) => {
      onSubscribe(body);
    });
  };
  return await userInitChatWebsocket(onConnect, needRetry);

};

export async function initLocalChat() {
  const chatMessage = await getChatMessages();
  if (chatMessage) {
    const dispatch = store.dispatch;
    dispatch(initMessage(chatMessage));
  }
  return true;
}

export async function saveLocalChat() {
  const chatMessage = store.getState().chat.chatMessage;
  if (!chatMessage) {
    return;
  }
  setChatMessages(chatMessage).then();
}

export async function clearLocalChat() {
  const dispatch = store.dispatch;
  dispatch(clearChat(null));
}

export async function delChatByUserCode(orderId) {
  const dispatch = store.dispatch;
  dispatch(deleteChat(orderId));
  saveLocalChat().then();
}
