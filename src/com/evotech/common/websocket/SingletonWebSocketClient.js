import { defaultHeaders } from "../http/HttpUtil";
import { getUserToken } from "../appUser/UserConstant";
import defaultClient from "./WebSocketClient";

let socketClient;
let intervalJob;
let newSocket;

export const getSocketClient = async () => {
  //  存在
  if (socketClient) {
    return socketClient;
  }
  if (newSocket) {
    return newSocket;
  }
  const token = defaultHeaders.getAuthentication(await getUserToken());
  socketClient = defaultClient(token);
  return socketClient;
};

export const newSocketClient = async () => {
  //  已经创建新的socket
  if (newSocket) {
    return newSocket;
  }
  newSocket = defaultClient(defaultHeaders.getAuthentication(await getUserToken()));
  return newSocket;
};

export const replaceOldSocket = () => {
  socketClient = newSocket;
  newSocket = null;
};

export const mergeSocketClient = (newClient) => {
  if (!socketClient) {
    return newClient;
  }
  socketClient.disconnect();
  //重试订阅
  connect(newClient, (client) => {
    Object.keys(socketClient.subscriptions).forEach(subscription => {
      Object.entries(socketClient.handlers[subscription]).forEach(([k, v]) => {
        newClient.subscribe(subscription, k, v);
      });
    });
  }).then();

  return newClient;
};
export const whenConnect = async (onConnect) => {
  if (socketClient.client.connected) {
    onConnect(socketClient);
    return;
  }
  await connect(socketClient, onConnect).then();
};


const connect = async (socketClient, onConnect) => {
  if (socketClient.client.active && socketClient.client.connected) {
    onConnect(socketClient);
    return;
  }
  socketClient.connect((frame) => {
    onConnect(socketClient, frame);
  }, (onError) => {
    console.info("websocket error", onError);
  }, (onClose) => {
    socketClient.client.forceDisconnect();
    socketClient.closed = true;
    //异常关闭
    /*  if (!socketClient.shouldClosed) {
          if (!intervalJob) {
           /!*   intervalJob = setInterval(async () => {
                /!*  const socketClient = await newSocketClient();
                  mergeSocketClient(socketClient)

                  setTimeout(async () => {
                      if (socketClient && socketClient.client.active) {
                          if (!socketClient.client.connected) {
                              await socketClient.client.deactivate();
                          } else {
                              replaceOldSocket();
                              clearInterval(intervalJob);
                          }
                      }
                  }, 1000);*!/
              }, 5000);*!/
          }
      }*/
  });

};

const reSetSocketConn = async () => {
  const socketClient = await newSocketClient();
  mergeSocketClient(socketClient);
  setTimeout(async () => {
    if (socketClient && socketClient.client.active) {
      if (!socketClient.client.connected) {
        await socketClient.client.deactivate();
      } else {
        replaceOldSocket();
        clearInterval(intervalJob);
      }
    }
  }, 1000);
};

export const socketExceptionClose = () => {
  return socketClient && !socketClient.shouldClosed && socketClient.closed;
};

export const retrySocketConn = async () => {
  // socketClient 为null  newSocket 不为null 则任务当前正在重试 为null则认为当前不需要 socket连接
  //异常关闭
  if (socketExceptionClose()) {
    //重试
    await reSetSocketConn();
  }
};

export const existSocketClient = () => {
  return socketClient != null;
};


export const clientStatus = () => {
  if (!socketClient) {
    return false;
  }
  return socketClient.client.connected;
};

export const checkClientStatus = () => {
  return socketClient && !socketClient.shouldClosed && socketClient.closed;
};

export const closeWebsocket = () => {
  clearInterval(intervalJob);
  if (socketClient) {
    socketClient.disconnect();
  }
  socketClient = null;
};
