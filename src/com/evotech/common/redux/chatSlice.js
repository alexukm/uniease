import { createSlice } from "@reduxjs/toolkit";
import { saveLocalChat } from "./UserChat";

const initialState = {
  chatList: {},
  chatMessage: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat(state, action) {
      state.chatMessage = {};
      state.chatList = {};
    },
    addMessage(state, action) {
      const message = action.payload;
      if (state.chatMessage[message.userCode]) {
        state.chatMessage[message.userCode] = [message, ...state.chatMessage[message.userCode]];
      } else {
        state.chatMessage[message.userCode] = [message];
      }
      setTimeout(async () => {
        console.log("save chat list");
        await saveLocalChat().then();
      }, 0.1);
    },
    addChatList(state, action) {
      const chat = action.payload;
      state.chatList[chat.userCode] = chat;
    },
    initChatList(state, action) {
      state.chatList = action.payload;
    },
    initMessage(state, action) {
      state.chatMessage = action.payload;
    },
    deleteChat(state, action) {
      const userCode = action.payload;
      delete state.chatList[userCode];
      delete state.chatMessage[userCode];
      setTimeout(() => {
        saveLocalChat().then();
      }, 0.1);
    },
    deleteChatByOrderId(state, action) {
      const userOrderId = action.payload;
      const chatListKeys = Object.keys(state.chatList);
      for (const key of chatListKeys) {
        if (state.chatList[key].orderId === userOrderId) {
          delete state.chatList[key];
          delete state.chatMessage[key];
          setTimeout(() => {
            saveLocalChat().then();
          }, 0.1);
          break;
        }
      }
    },
  },
});

export const {
  clearChat,
  addMessage,
  deleteChat,
  initMessage,
  addChatList,
  initChatList,
  deleteChatByOrderId,
} = chatSlice.actions;

export const selectChatList = state => state.chat.chatList;
export const selectChatMessage = state => state.chat.chatMessage;

export default chatSlice.reducer;
