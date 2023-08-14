import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { Box } from "native-base";
import { delChatByUserCode, UserChat } from "../com/evotech/common/redux/UserChat";
import { queryChatList } from "../com/evotech/common/http/BizHttpUtil";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import uuid from "react-native-uuid";
import { useSelector } from "react-redux";
import { selectChatMessage } from "../com/evotech/common/redux/chatSlice";


export default function ChatList({ navigation }) {
  const messages = useSelector(selectChatMessage);
  // const chatList = useSelector(selectChatList);
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    queryChatList().then((data) => {
      const chatList = {};
      responseOperation(data.code, () => {
        if (data.data.length < 0) {
          return;
        }
        console.log("chat list", data.data);
        data.data.map(list => {
          const msg = messages[list.orderId];
          console.log("msg",msg);
          let time = null;
          let lastMsg = "";
          if (msg && msg.length > 0) {
            time = msg[0].createdAt;
            lastMsg = msg[0].text;
          }
          chatList[list.orderId] = {
            id: uuid.v4(),
            title: list.receiverName,
            orderId: list.orderId,
            message: lastMsg,
            time: time,
            userCode: list.receiverUserCode,
            createdAt: list.createDateTime,
            unread: "",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWgelHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
          };
        });
        setChatList(chatList);
        console.log("chatList", Object.values(chatList));
        setTimeout(async () => {
          await UserChat(true).then();
        }, 0);
      }, () => {
      });
    });
  }, []);


  const openChat = (item) => {
    navigation.navigate("ChatRoom", {
      receiverName: item.title,
      receiverUserCode: item.userCode,
      orderId: item.orderId,
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={Object.values(chatList)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.header}>
              <Box bg="white" shadow={2} rounded="lg" p={4} my={2} style={{ marginTop: 0 }}>
                <Text style={styles.headerText}>Chats</Text>
              </Box>
            </View>
          }
          renderItem={({ item }) => (
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
                        delChatByUserCode(item.userCode).then();
                      },
                    },
                  ],
                );
              }}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
