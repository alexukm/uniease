import React, {useEffect, useState} from "react";
import {Composer, GiftedChat, InputToolbar} from "react-native-gifted-chat";
import {format} from "date-fns";
import {useDispatch, useSelector} from "react-redux";
import {addChatList, addMessage, selectChatMessage} from "../com/evotech/common/redux/chatSlice";
import uuid from "react-native-uuid";
import {UserChat} from "../com/evotech/common/redux/UserChat";
import {
    clientStatus,
    whenConnect,
} from "../com/evotech/common/websocket/SingletonWebSocketClient";
import {SafeAreaView} from "react-native";

export default function ChatRoom({route}) {
    const {receiverName, receiverUserCode,orderId} = route.params;
    const dispatch = useDispatch();

    const messages = useSelector(selectChatMessage);
    const [chatStatus, setChatStatus] = useState(true);
    const initChatClient = async () => {
        await UserChat(false);
    };
    useEffect(() => {
        initChatClient().then();
    }, []);

    async function onSend(newMessages = []) {

        if (!chatStatus) {
            alert("Order completed, unable to send messages.");
            return;
        }

        try {
            const param = {
                receiverName: receiverName,
                receiverUserCode: receiverUserCode,
                message: newMessages[0].text,
                requestTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            };
            const message = {
                _id: uuid.v4(),
                userCode: receiverUserCode,
                text: newMessages[0].text,
                createdAt: param.requestTime,
                user: {
                    _id: 1,
                    name: receiverName,
                },
            };
            // 连接被异常关闭
            if (!clientStatus()) {
                await UserChat(true).then();
                if (!clientStatus()) {
                    alert("Connection is not established,Please try again later");
                    return;
                }
            }
            await whenConnect((socketClient) => {
                socketClient.publish({destination: "/uniEase/v1/order/chat/ride", body: JSON.stringify(param)});
            });
            dispatch(addMessage(message));
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <SafeAreaView style={{flex: 1, justifyContent: "space-between", paddingBottom: 30}}>
            <GiftedChat
                messages={messages[orderId] || []}
                onSend={newMessages => onSend(newMessages)}
                user={{_id: 1}}
                renderInputToolbar={(props) => (
                    <InputToolbar {...props}
                                  renderComposer={(composerProps) => (
                                      <Composer
                                          {...composerProps}
                                          textInputStyle={{
                                              ...composerProps.textInputStyle,
                                              color: "black"
                                          }} // 这里设置输入框文字颜色为黑色
                                      />
                                  )}
                    />
                )}
            />
        </SafeAreaView>
    );
}

