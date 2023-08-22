import {closeWebsocket, getSocketClient, whenConnect} from "./SingletonWebSocketClient";
import {queryChatList} from "../http/BizHttpUtil";
import {responseOperation } from "../http/ResponseOperation";



export const userInitChatWebsocket = async (onConnect, needRetry) => {
    await getSocketClient().then();
    await whenConnect(socket => {
        onConnect(socket);
        const param = {
            ready: true,
        };
        if (needRetry) {
            socket.publish({destination: '/uniEase/v1/order/chat/retry', body: JSON.stringify(param)});
        }
        return socket;
    });
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
}

export const driverCancelSubscribe = async () => {
    queryChatList().then((data) => {
        responseOperation(data.code, () => {
            if (data.data.length === 0) {
                closeWebsocket();
            }
        }, () => {
        });
    });
}
