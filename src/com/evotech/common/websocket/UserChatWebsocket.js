import {getSocketClient, whenConnect} from "./SingletonWebSocketClient";
import {queryDriverOrderStatus, queryUserOrderStatus} from "../http/BizHttpUtil";
import {UserChat} from "../redux/UserChat";


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
        client.subscribe('/user/topic/orderAccept', 'orderAccept', (body) => {
            // todo  调用系统通知
            console.log("被接单 开启聊天订阅")
            if (subscribe) {
                subscribe(body);
            }
            UserChat(false).then();
            alert("Your order accepted")
        });
    })
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
    queryUserOrderStatus().then((data) => {
        if (data.code === 200) {
            // 没有待出行和旅途中的订单  聊天订阅关闭
            doUserCancelSubscribe(data.data).then();
        }
    });
}

export const driverCancelSubscribe = async () => {
    queryDriverOrderStatus().then((data) => {
        if (data.code === 200) {
            doDriverCancelSubscribe(data.data).then();
        }
    })
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
