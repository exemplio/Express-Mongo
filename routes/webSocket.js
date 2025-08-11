import { WebSocketServer } from 'ws';
import Message from '../models/MessageModel.js';

export function initChatWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function heartbeat() {
    this.isAlive = true;
  }

  function safeSend(ws, obj) {
    try {
      ws.send(JSON.stringify(obj));
    } catch (_) {}
  }

  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    try {
      const history = await Message.find().sort({ createdAt: -1 }).limit(50).lean();
      console.log('WebSocket connection established:', req.socket.remoteAddress);
      ws.send(
        JSON.stringify({
          type: 'history',
          payload: history.reverse().map((m) => ({
            id: m._id,
            userId: m.userId || '',
            username: m.username,
            text: m.text,
            createdAt: m.createdAt,
          })),
        })
      );
    } catch (e) {
      console.error('Failed to load history:', e);
    }

    // ws.on('message', async (data) => {
    //   try {
    //     const msg = JSON.parse(data.toString());
    //     if (msg?.type === 'message') {
    //       const { chat, sender = '', username, content, receiver } = msg || {};
    //       if (!username || !content || !receiver) return ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message format' }));          
    //       const message = new Message({ chat, sender, username, content, receiver });
    //       await message.save();
    //       const outgoing = {
    //         type: 'message',
    //         payload: {
    //           id: message._id,
    //           sender: message.sender || '',
    //           username: message.username,
    //           content: message.content,
    //           createdAt: message.createdAt,
    //         },
    //       };
    //       console.log('WebSocket connection established:', req.socket.remoteAddress);
    //       wss.clients.forEach((client) => {
    //         if (client.readyState === 1) client.send(JSON.stringify(outgoing));
    //       });
    //     } else if (msg?.type === 'typing') {
    //       const outgoing = { type: 'typing', payload: msg.payload };
    //       wss.clients.forEach((client) => {
    //         if (client !== ws && client.readyState === 1) client.send(JSON.stringify(outgoing));
    //       });
    //     }
    //   } catch (e) {
    //     console.error('WS message error:', e);
    //   }
    // });

    ws.on("message", (data) => {
      let msg;
      try {
        msg = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
      } catch (e) {
        safeSend(ws, { type: "error", error: "invalid_json" });
        return;
      }
      if (msg.type === "hello" && typeof msg.id === "string" && msg.id.length > 0) {
        deviceId = msg.id;
        clientsById.set(deviceId, ws);
        safeSend(ws, { type: "hello_ack", id: deviceId });
        return;
      }
      if (msg.type === "broadcast") {
        const payload = { type: "broadcast", from: deviceId, data: msg.data ?? null };
        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) safeSend(client, payload);
        }
        return;
      }
      if (msg.type === "send" && typeof msg.to === "string") {
        const target = clientsById.get(msg.to);
        if (target && target.readyState === WebSocket.OPEN) {
          safeSend(target, { type: "message", from: deviceId, data: msg.data ?? null });
          safeSend(ws, { type: "send_ack", to: msg.to });
        } else {
          safeSend(ws, { type: "error", error: "target_not_connected", to: msg.to });
        }
        return;
      }
      safeSend(ws, { type: "error", error: "unknown_type" });
    });

    ws.on('error', (e) => console.error('WS error:', e));
    ws.on('close', () => {});
  });

  // Heartbeat to close dead connections
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