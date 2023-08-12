import {defaultHeaders} from "../http/HttpUtil";
import {getUserToken} from "../appUser/UserConstant";
import defaultClient from "./WebSocketClient";

let socketClient;
let intervalJob;
let newSocket;
export const getSocketClient = async (newSocket) => {
    //  存在
    if (socketClient && !newSocket) {
        return socketClient;
    }
    const token = defaultHeaders.getAuthentication(await getUserToken());
    socketClient = defaultClient(token)
    return socketClient;
}

export const newSocketClient = async () => {
    //  已经创建新的socket
    if (newSocket) {
        return newSocket;
    }
    newSocket = defaultClient(defaultHeaders.getAuthentication(await getUserToken()));
    return newSocket;
}

export const replaceOldSocket = () => {
    socketClient = newSocket;
    newSocket = null;
}

export const mergeSocketClient = (newClient) => {
    if (!socketClient) {
        return newClient;
    }

    //重试订阅
    connect(newClient, (client) => {
        Object.keys(socketClient.subscriptions).forEach(subscription => {
            Object.entries(socketClient.handlers[subscription]).forEach(([k, v]) => {
                newClient.subscribe(subscription, k, v);
            })
        });
    },).then();

    return newClient;
}
export const whenConnect = async (onConnect) => {
    if (socketClient.client.connected) {
        onConnect(socketClient);
        return;
    }
    await connect(socketClient, onConnect).then();
}


const connect = async (socketClient, onConnect) => {
    if (socketClient.client.active && socketClient.client.connected) {
        onConnect(socketClient);
        return
    }
    socketClient.connect((frame) => {
        onConnect(socketClient, frame)
    }, (onError) => {
        console.info("websocket error", onError);
    }, (onClose) => {
        socketClient.client.forceDisconnect();
        //异常关闭
        if (!socketClient.shouldClosed) {
            if (!intervalJob) {
                intervalJob = setInterval(async () => {
                    const socketClient = await newSocketClient();
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
                    }, 1000);
                }, 5000);
            }
        }
    });

}


export const clientStatus = () => {
    if (!socketClient) {
        return false
    }
    return socketClient.client.connected;

}

export const closeWebsocket = () => {
    clearInterval(intervalJob);
    if (socketClient) {
        socketClient.disconnect();
    }
    socketClient = null;
}
