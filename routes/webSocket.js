import { WebSocketServer } from 'ws';
import Messages from '../models/MessageModel.js';
import ChatSchema from '../models/ChatModel.js';
import validator from 'validator';
import { v4 as uuidv4  } from 'uuid';

export function initChatWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const userSockets = {};
  function safeSend(ws, obj) {
    try {
      ws.send(JSON.stringify(obj));
    } catch (_) {}
  }

  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    setInterval(() => {
      wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
    const params = new URLSearchParams(req.url.split('?')[1]);
    const userId = params.get('userId');
    if (!userId) {
      ws.close(1008, "No userId");
      return;
    }
    if (!userSockets[userId]) userSockets[userId] = [];
    userSockets[userId].push(ws);

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
            if (!chatId || !validator.isUUID(String(chatId))) {
                return safeSend(ws, { type: "error", error: "Invalid or missing chatId" });
            }
            const raw = await Messages.find({ chatId: chatId })
            .populate('senderId', 'username displayName')
            .exec();
            for (const client of wss.clients) {
              if (client.readyState === WebSocket.OPEN) safeSend(client, raw);
            }
          } catch (error) {
            safeSend(ws, { type: "error", error: error?.message || "Failed to send message" });
          }
          break;
        case "send":
          try {
              const { senderId, content, receiverId, lastMessage } = msg;
              if (msg?.chatId == "empty") {                
                const chat = new ChatSchema({ members: [userId,receiverId], name:"", isGroup:false, lastMessage:"", chatId: uuidv4() });
                await chat.save();
                const message = new Messages({
                    chatId: chat?.chatId, senderId: senderId, content: content, receiverId: receiverId, lastMessage: lastMessage
                });
                await message.save();
                await ChatSchema.findOneAndUpdate(
                  { chatId: chat?.chatId },
                  { lastMessage: message.content }
                );
                safeSend(ws, { type: "success", message: message });
                if (userSockets[receiverId]) {
                    userSockets[receiverId].forEach(clientWs => {
                        if (clientWs.readyState === clientWs.OPEN) {                          
                            const { _id, __v, ...messageWithoutId } = message?._doc || {};
                            safeSend(clientWs, { message: messageWithoutId });
                        }
                    });
                } 
              }else{
                  const message = new Messages({
                    chatId: msg?.chatId, senderId: senderId, content: content, receiverId: receiverId, lastMessage: lastMessage
                  });
                  await message.save();
                  await ChatSchema.findOneAndUpdate(
                    { chatId: msg?.chatId },
                    { lastMessage: message.content }
                  );
                  safeSend(ws, { type: "success", message: message });
                  if (userSockets[receiverId]) {
                    userSockets[receiverId].forEach(clientWs => {
                      if (clientWs.readyState === clientWs.OPEN) {
                        const { _id, __v, ...messageWithoutId } = message?._doc || {};
                        safeSend(clientWs, { message: messageWithoutId });
                      }
                    });
                  }          
              }
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

  wss.on('close', () => clearInterval(interval));

  return wss;
}

export default initChatWebSocket;