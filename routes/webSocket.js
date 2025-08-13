import { WebSocketServer } from 'ws';
import Message from '../models/MessageModel.js';
import mongoose from 'mongoose';
import ChatSchema from '../models/ChatModel.js';

export function initChatWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  function safeSend(ws, obj) {
    try {
      ws.send(JSON.stringify(obj));
    } catch (_) {}
  }

  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    let deviceId = null;

    ws.on("message", async (data) => {
      let msg;
      try {
        msg = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
      } catch (e) {
        safeSend(ws, { type: "error", error: "invalid_json" });
        return;
      }
      switch (msg.type) {
        case "receive":
          try {
            const chatId = msg.chatId;
            if (!chatId || !mongoose.Types.ObjectId.isValid(String(chatId))) {
                return safeSend(ws, { type: "error", error: "Invalid or missing chatId" });
            }
            const raw = await Message.find({ chat: chatId })
            .populate('sender', 'username displayName -_id')
            .lean()
            .exec();
            const payload = raw.map(({ _id, __v, ...rest }) => rest);
            for (const client of wss.clients) {
              if (client.readyState === WebSocket.OPEN) safeSend(client, payload);
            }            
          } catch (error) {
            safeSend(ws, { type: "error", error: error?.message || "Failed to send message" });
          }
          break;
        case "send":
          try {
              const { chatId, senderId, content, receiverId, lastMessage } = msg;
              const message = new Message({
                  chat: chatId, sender: senderId, content: content, receiver: receiverId, lastMessage: lastMessage
              });
              await message.save();
              await ChatSchema.findByIdAndUpdate(chatId, { lastMessage: message._id });
              safeSend(ws, { type: "success", message: message });
          } catch (err) {
            safeSend(ws, { type: "error", error: err?.message || "Failed to send message" });
          }
          break;      
        default:
          safeSend(ws, { type: "error", error: "unknown_type" });
          break;
      }
    });

    ws.on('error', (e) => console.error('WS error:', e));
    ws.on('close', () => {});
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  return wss;
}

export default initChatWebSocket;