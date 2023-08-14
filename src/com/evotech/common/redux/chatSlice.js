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
      if (state.chatMessage[message.orderId]) {
        state.chatMessage[message.orderId] = [message, ...state.chatMessage[message.orderId]];
      } else {
        state.chatMessage[message.orderId] = [message];
      }
      setTimeout(async () => {
        await saveLocalChat().then();
      }, 0.1);
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
      delete state.chatMessage[userOrderId];
    },
  },
});

export const {
  clearChat,
  addMessage,
  deleteChat,
  initMessage,
  addChatList,

  deleteChatByOrderId,
} = chatSlice.actions;
export const selectChatMessage = state => state.chat.chatMessage;

export default chatSlice.reducer;
