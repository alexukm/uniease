import React, {useEffect} from 'react';
import {View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useSelector, useDispatch } from "react-redux";
import {selectChatList} from "../com/evotech/common/redux/chatSlice";
import { deleteChat } from '../com/evotech/common/redux/chatSlice';


export default function ChatList({navigation}) {
    const chatList = useSelector(selectChatList);

    const dispatch = useDispatch();


    useEffect(() => {
        // 检查每个聊天，如果它的创建时间距离现在超过三天，那么就删除它
        for (const chatKey in chatList) {
            if (new Date().getTime() - chatList[chatKey].createdAt > 3 * 24 * 60 * 60 * 1000) {
                dispatch(deleteChat(chatKey));
            }
        }
    }, []);


    const openChat = (item) => {
        navigation.navigate('ChatRoom', {
            receiverName: item.title,
            receiverUserCode: item.userCode,
            orderStatus: item.orderStatus,
        });
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Chats</Text>
            </View>
            <FlatList
                data={Object.values(chatList)}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => openChat(item)}
                        onLongPress={() => {
                            Alert.alert(
                                'Delete chat',
                                'Are you sure you want to delete this chat?',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            dispatch(deleteChat(item.userCode));
                                        }
                                    }
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
                            <Text style={styles.chatTime}>{item.time}</Text>
                            {item.unread > 0 &&
                                <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>}
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
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
        fontWeight: 'bold',
        color: 'black', // 设置字体颜色为黑色
    },
    chatItem: {
        flexDirection: 'row',
        marginVertical: 10, // 调整垂直间距
        paddingBottom: 10, // 添加底部内边距
        alignItems: 'center',
        borderBottomWidth: 1, // 添加底部边框
        borderBottomColor: '#ccc', // 边框颜色为灰色
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
        fontWeight: 'bold',
    },
    chatMessage: {
        color: 'grey',
    },
    chatMeta: {
        marginLeft: 10,
        alignItems: 'flex-end',
    },
    chatTime: {
        color: 'grey',
    },
    badge: {
        marginTop: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
    },
});
