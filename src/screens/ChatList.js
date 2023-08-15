import React, {useEffect, useState} from "react";
import {Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Box} from "native-base";
import {delChatByUserCode, UserChat} from "../com/evotech/common/redux/UserChat";
import {queryChatList} from "../com/evotech/common/http/BizHttpUtil";
import {responseOperation} from "../com/evotech/common/http/ResponseOperation";
import uuid from "react-native-uuid";
import {useDispatch, useSelector} from "react-redux";
import {clearChat, deleteChatByOrderIds, selectChatMessage} from "../com/evotech/common/redux/chatSlice";
import {clientStatus} from "../com/evotech/common/websocket/SingletonWebSocketClient";
import {useFocusEffect} from "@react-navigation/native";
import {tr} from "date-fns/locale";


export default function ChatList({navigation}) {
    const messages = useSelector(selectChatMessage);
    const [firstLoad, setFirstLoad] = useState(true);
    const [chatList, setChatList] = useState({});
    const messagesRef = React.useRef(messages);
    const dispatch = useDispatch();

    const initChatList = async (messages) => {
        const data = await queryChatList().then((data) => {
            const newChatList = {};
            return responseOperation(data.code, () => {
                if (data.data.length === 0) {
                    setChatList({});
                    dispatch(clearChat());
                    return null;
                }
                return data.data;
            }, () => {
            });
        });
        if (data) {
            if (!clientStatus()) {
                await UserChat(true).then();
            }

            const localOrderIds = Object.keys(messages);
            if (localOrderIds.length > 0) {
                const orderIds = data.data.map(list => list.orderId);
                const needDeleteOrderIds = localOrderIds.filter(orderId => !orderIds.includes(orderId));
                dispatch(deleteChatByOrderIds(needDeleteOrderIds));
            }

            data.map(list => {
                const msg = messages[list.orderId];
                let time = null;
                let lastMsg = "";
                if (msg && msg.length > 0) {
                    time = msg[0].createdAt;
                    lastMsg = msg[0].text;
                }

                newChatList[list.orderId] = {
                    id: uuid.v4(),
                    title: list.receiverName,
                    orderId: list.orderId,
                    receiverOrderId: list.receiverOrderId,
                    message: lastMsg,
                    time: time,
                    userCode: list.receiverUserCode,
                    createdAt: list.createDateTime,
                    unread: "",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWgelHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
                };
            });
            setChatList(newChatList);
        }
    };

    const hasNewOrderMessage = () => {
        const chatOrderIds = Object.keys(chatList);
        const messageOrderIds = Object.keys(messages);
        return messageOrderIds.some(orderId => !chatOrderIds.includes(orderId));
    };
    const updateChatListWithNewMessages = async (messages) => {
        if (Object.keys(chatList).length === 0) {
            await initChatList(messages);
            return;
        }
        if (hasNewOrderMessage()) {
            await initChatList(messages);
        } else {
            // 遍历chatList，为每个item更新最新的消息内容
            const newChatList = {...chatList};
            for (let key in newChatList) {
                const msg = messages[key];
                if (msg && msg.length > 0) {
                    newChatList[key].message = msg[0].text;
                    newChatList[key].time = msg[0].createdAt;
                }
            }
            setChatList(newChatList); // 使用setChatList设置新的状态
        }
    };
    useEffect(() => {
        if (!(messages && Object.keys(messages).length > 0)) {
            return;
        }
        updateChatListWithNewMessages(messages).then();
        messagesRef.current = messages;
    }, [messages]);

    useFocusEffect(
        React.useCallback(() => {
            if (!firstLoad) {
                initChatList(messagesRef.current).then();
                if (Object.keys(chatList).length > 0 && !clientStatus()) {
                    setTimeout(async () => {
                        await UserChat(true).then();
                    }, 0);
                }
            } else {
                initChatList(messages).then();
              /*  if (Object.keys(chatList).length > 0) {
                    //第一次进入页面
                    const retry = firstLoad;
                    setTimeout(async () => {
                        await UserChat(retry).then();
                    }, 0);
                }*/
                setFirstLoad(false);
            }
            return () => {
            };
        }, [firstLoad])
    );

    const openChat = (item) => {
        navigation.navigate("ChatRoom", {
            receiverName: item.title,
            receiverUserCode: item.userCode,
            orderId: item.orderId,
            receiverOrderId: item.receiverOrderId,
        });
    };

    function formatChatTime(timestamp) {
        const now = new Date();
        const messageDate = new Date(timestamp);

        // Check if it's the same day
        if (now.toDateString() === messageDate.toDateString()) {
            const hour = messageDate.getHours();
            const minute = String(messageDate.getMinutes()).padStart(2, "0");  // Ensure minute is always two digits
            return `${hour}:${minute}`;
        }

        // Check if it's yesterday
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (yesterday.toDateString() === messageDate.toDateString()) {
            return "yesterday";
        }

        // Check if within the same week
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        if (messageDate >= startOfWeek) {
            const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return weekdays[messageDate.getDay()];
        }

        // If it's an earlier date
        const day = messageDate.getDate();
        const month = messageDate.getMonth() + 1;
        const year = messageDate.getFullYear();
        return `${month}/${day}/${year}`;
    }


    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <FlatList
                    data={Object.values(chatList)}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <Box bg="white" shadow={2} rounded="lg" p={4} my={2} style={{marginTop: 0}}>
                                <Text style={styles.headerText}>Chats</Text>
                            </Box>
                        </View>
                    }
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => openChat(item)}
                            onLongPress={() => {
                                Alert.alert(
                                    "Delete chat",
                                    "Are you sure you want to delete this chat?",
                                    [
                                        {
                                            text: "Cancel",
                                            style: "cancel",
                                        },
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                delChatByUserCode(item.orderId).then();
                                            },
                                        },
                                    ],
                                );
                            }}
                        >
                            <Image source={{uri: item.avatar}} style={styles.avatar}/>
                            <View style={styles.chatInfo}>
                                <Text style={styles.chatTitle}>{item.title}</Text>
                                <Text style={styles.chatMessage}>{item.message}</Text>
                            </View>
                            <View style={styles.chatMeta}>
                                <Text style={styles.chatTime}>{formatChatTime(item.time)}</Text>
                                {item.unread > 0 &&
                                    <View style={styles.badge}><Text
                                        style={styles.badgeText}>{item.unread}</Text></View>}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        marginVertical: 20, // 增加顶部和底部的间距
    },
    headerText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "black", // 设置字体颜色为黑色
    },
    chatItem: {
        flexDirection: "row",
        marginVertical: 10, // 调整垂直间距
        paddingBottom: 10, // 添加底部内边距
        alignItems: "center",
        borderBottomWidth: 1, // 添加底部边框
        borderBottomColor: "#ccc", // 边框颜色为灰色
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 10,
    },
    chatTitle: {
        fontWeight: "bold",
        color: "black",
    },
    chatMessage: {
        color: "grey",
    },
    chatMeta: {
        marginLeft: 10,
        alignItems: "flex-end",
    },
    chatTime: {
        color: "grey",
    },
    badge: {
        marginTop: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: "white",
        fontSize: 10,
    },
});
