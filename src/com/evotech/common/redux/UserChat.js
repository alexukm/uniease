import { addChatList, addMessage, clearChat, deleteChat, initChatList, initMessage } from "./chatSlice";
import uuid from "react-native-uuid";
import { userInitChatWebsocket } from "../websocket/UserChatWebsocket";
import store from "./store";
import {
  delChatList,
  delChatMessages,
  getChatList,
  getChatMessages,
  setChatList,
  setChatMessages,
} from "../appUser/UserConstant";


export const UserChat = async (needRetry) => {
  const dispatch = store.dispatch;

  const buildChatMsg = (body) => {
    const receiveMsg = JSON.parse(body);
    const message = {
      _id: uuid.v4(),
      userCode: receiveMsg.senderUserCode,
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

export async function initLocalChat(orderStatusList) {
  if (!(orderStatusList.pending || orderStatusList.inTransit)) {
    delChatList().then();
    delChatMessages().then();
    return false;
  }

  //加载本地聊天信息
  const chatList = await getChatList();

  if (!chatList) {
    return true;
  }

  const chatMessage = await getChatMessages();
  const chatListKeys = Object.keys(chatList);

  for (const key of chatListKeys) {
    const orderId = chatList[key].orderId;
    const needSave = orderStatusList.pendingOrders.includes(orderId) || orderStatusList.inTransitOrders.includes(orderId);
    if (!needSave) {
      delete chatList[key];
      if (chatMessage) {
        delete chatMessage[key];
      }
    }
  }

  if (chatList.length < 0) {
    return true;
  }

  const dispatch = store.dispatch;
  dispatch(initChatList(chatList));

  if (chatMessage) {
    dispatch(initMessage(chatMessage));
  }
  return true;
}

export async function saveLocalChat() {
  const chatList = store.getState().chat.chatList;
  if (!chatList) {
    return;
  }
  setChatList(chatList).then();
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

export async function delChatByUserCode(userCode) {
  const dispatch = store.dispatch;
  dispatch(deleteChat(userCode));
  saveLocalChat().then();
}
