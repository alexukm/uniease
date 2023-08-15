import {closeWebsocket, getSocketClient, whenConnect} from "./SingletonWebSocketClient";
import {queryChatList, queryDriverOrderStatus, queryUserOrderStatus} from "../http/BizHttpUtil";
import {UserChat} from "../redux/UserChat";
import { responseOperation } from "../http/ResponseOperation";
import { showDialog } from "../alert/toastHelper";

import {  notifyOrderChannel } from "../notify/SystemNotify";
import {clearChat} from "../redux/chatSlice"; // 这是新导入的库



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

export const userOrderWebsocket = async (subscribe) => {
    await getSocketClient().then();
    await whenConnect((client) => {
        client.subscribe('/user/topic/orderNotify', 'orderNotify', (body) => {
            body = JSON.parse(body)
            // 调用系统通知
            notifyOrderChannel( body);
            if (subscribe) {
                subscribe(body);
            }
            UserChat(false).then();
        });
    });
};

/*export const DriverRefreshOrder = async (onSubscribe) => {
    return socketConnect((client, frame) => {
    }).then(data => {
       return  data.subscribe('/topic/refreshOrder', (body) => {
            onSubscribe(body)
        });
    });
}*/


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
const doUserCancelSubscribe = async (orderStatus) => {
    const client = await getSocketClient().then();
    if (client) {
        if (!(orderStatus.pending || orderStatus.inTransit)) {
            client.cancelSubscribe('/user/topic/chat');
        }
        //没有待接单 订单
        if (!orderStatus.awaiting) {
            client.cancelSubscribe('/user/topic/orderAccept');
        }
    }
}
const doDriverCancelSubscribe = async (orderStatus) => {
    const client = await getSocketClient().then();
    if (client) {
        if (!(orderStatus.pending || orderStatus.inTransit)) {
            client.cancelSubscribe('/user/topic/chat');
        }
    }
}
