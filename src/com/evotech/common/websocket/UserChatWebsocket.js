import {
  clientStatus,
  closeWebsocket, existSocketClient,
  getSocketClient,
  retrySocketConn,
  whenConnect,
} from "./SingletonWebSocketClient";
import { getUserChatOnline, queryChatList } from "../http/BizHttpUtil";
import { responseOperation } from "../http/ResponseOperation";
import { clearChat } from "../redux/chatSlice";
import { UserChat } from "../redux/UserChat";


export const userInitChatWebsocket = async (onConnect, needRetry) => {
  await getSocketClient().then();
  await whenConnect(socket => {
    onConnect(socket);
    const param = {
      ready: true,
    };
    if (needRetry) {
      socket.publish({ destination: "/uniEase/v1/order/chat/retry", body: JSON.stringify(param) });
    }
    return socket;
  });
};


export const socketConnect = async () => {
  const onlineStatus = await getUserChatOnline().then((data) => {
    return responseOperation(data.code, () => {
      return data.data;
    }, () => {
      return false;
    });
  });
  //不在线
  if (!onlineStatus) {
    if (existSocketClient()) {
      await retrySocketConn();
    } else {
      await UserChat(true);
    }
  }
};


export const userCancelSubscribe = async () => {
  queryChatList().then((data) => {
    responseOperation(data.code, () => {
      if (data.data.length === 0) {
        closeWebsocket();
      }
    }, () => {
    });
  });
};

export const driverCancelSubscribe = async () => {
  queryChatList().then((data) => {
    responseOperation(data.code, () => {
      if (data.data.length === 0) {
        closeWebsocket();
      }
    }, () => {
    });
  });
};
