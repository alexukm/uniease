import {Client} from "@stomp/stompjs";
import {closeWebsocket} from "./SingletonWebSocketClient";

export const defaultBrokerURL = "wss://unieaseapp.com/uniEase/ws-sfc";

class WebSocketClient {
    constructor(brokerURL, headers, reconnectDelay, heartbeatIncoming, heartbeatOutgoing) {
        this.client = new Client({
            brokerURL: brokerURL,
            connectHeaders: headers,
            debug: function (params) {
                // console.log(params);
            },
            reconnectDelay: reconnectDelay,
            heartbeatIncoming: heartbeatIncoming,
            heartbeatOutgoing: heartbeatOutgoing,
        });
        this.handlers = {};
        this.subscriptions = {};
        this.shouldClosed = false;
    }

    connect(onConnect, onError, onClose) {
        if (this.client.connected) {
            return;
        }
        this.client.onConnect = (frame) => {
            Object.keys(this.handlers).forEach(topic => {
                this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
                    this.handlers[topic].forEach((handler) => handler(message.body));
                });
            });

            this.subscribe('/user/topic/ping', 'ping', (body) => {
                console.log(JSON.stringify(body))
            })

            setInterval(() => {
                //已经断开连接  && 不需要关闭连接
                if (this.client.connected && !this.shouldClosed) {
                    this.publish({destination: '/uniEase/v1/heart/ping', body: JSON.stringify({message: 'ping'})});
                }
            }, 60000);
            if (onConnect) {
                onConnect(frame);
            }
        };
        this.client.onWebSocketError = (frame) => {
            if (onError) {
                onError(frame)
            }
        };
        this.client.onWebSocketClose = (frame) => {
            if (onClose) {
                onClose(frame)
            }
        };
        this.client.activate();
    }

    publish(params = {}) {
        this.client.publish(params);
    }

    subscribe(topic, key, handler) {
        // 不存在当前topic的handlers
        if (!this.handlers[topic]) {
            this.handlers[topic] = {};
        }
        // 如果不存在当前的handler 新增
        if (!this.handlers[topic][key]) {
            this.handlers[topic][key] = handler;
        }

        //没有被订阅过
        if (!this.subscriptions[topic]) {
            // 进行订阅
            this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
                if (this.handlers[topic]) {
                    Object.values(this.handlers[topic]).forEach((handler) => handler(message.body));
                }
            });
        }

        return () => {
            //取消订阅
            this.subscriptions[topic].unsubscribe();
            // 订阅记录
            delete this.subscriptions[topic];
            //清理handler
            delete this.handlers[topic];
        };

    }

    cancelSubscribe(topic) {
        console.log(topic);
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
        }
        // 订阅记录
        delete this.subscriptions[topic];
        //清理handler
        delete this.handlers[topic];

        const topicKeys = Object.keys(this.subscriptions);
        if (topicKeys.length === 1 && topicKeys[0] === '/user/topic/ping') {
            closeWebsocket()
        }
    }

    disconnect() {
        this.shouldClosed = true;
        Object.values(this.subscriptions).forEach(subscription => {
            subscription.unsubscribe();
        });
        this.client.deactivate().then(r => {
            console.log("close websocket client" + r);
        });
    }
}

export const defaultWebsocketClient = (headers) => {
    return new WebSocketClient(defaultBrokerURL, headers, 0, 4000, 4000);
};


const defaultClient = (headers) => {
    return defaultWebsocketClient(headers);
}


export default defaultClient;
