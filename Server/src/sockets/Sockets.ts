import { AuthManager } from '@/database/AuthManager.js';
import { RoomManager } from './RoomManager.js';

import { IncomingMessage } from 'http';
import WebSocket from 'ws';

export class SocketHandler {
  public static handleConnections = (wsServer: WebSocket.Server) => {
    wsServer.on('connection', async (socket) => {
      console.log('socket conected');

      socket.on('message', async (data) => {
        const { e, d } = JSON.parse(data.toString()) as App.message;

        if (e === 0) {
          const message = d as Api.JoinRoomData;
          console.log(`User ${message.userId} joined room ${message.roomId}`);
          if (RoomManager.isUserOnAnyRoom(message.userId)) return;
          RoomManager.joinRoom(socket, message.roomId, {
            userId: message.userId,
            userName: message.userName,
            socket,
            visibleArea: message.visibleArea,
          });
        } else if (e === 1) {
          const message = d as {
            userID: string;
            x: number;
            y: number;
            visibleArea?: { width: number; height: number };
            rock?: { x: number; y: number };
          };

          const room = RoomManager.isSocketOnAnyRoom(socket);
          if (!room) return;

          const game = room.getGame();

          if (message.visibleArea)
            game.getPlayer(message.userID)?.setVisibleArea(message.visibleArea);
          game.movePlayer(message.userID, message.x, message.y, message.rock);
        }
      });

      socket.on('close', async (reason, desc) => {
        console.log('User Disconnected', reason, desc);

        const room = RoomManager.isSocketOnAnyRoom(socket);

        console.log('user Disconected is on this Room');

        if (!room) return;

        const user = room.getPlayers().find((e) => e.socket === socket);

        if (!user) return;

        room.leave(user);
      });
    });
    // io.on('connection', async (socket) => {
    //   // await this.handleAuth(socket);

    // socket.on('joinRoom', async (data: Api.JoinRoomData) => {
    //   console.log(`User ${data.userId} joined room ${data.roomId}`);
    //   if (RoomManager.isUserOnAnyRoom(data.userId)) return;
    // RoomManager.joinRoom(socket, data.roomId, {
    //   userId: data.userId,
    //   userName: data.userName,
    //   SocketId: socket.id,
    //   visibleArea: data.visibleArea,
    // });
    // });

    //   socket.on(
    //     'updatePosition',
    //     async (data: {
    //       userID: string;
    //       x: number;
    //       y: number;
    //       visibleArea?: { width: number; height: number };
    //     }) => {
    //       const room = RoomManager.isSocketOnAnyRoom(socket.id);

    //       if (!room) return;

    //       const game = room.getGame();

    //       if (data.visibleArea)
    //         game.getPlayer(data.userID)?.setVisibleArea(data.visibleArea);

    //       room.getGame().movePlayer(data.userID, data.x, data.y);
    //     },
    //   );

    // });
  };

  public static handleAuth = async (socket: WebSocket, request: IncomingMessage) => {
    const token = request.headers.authorization;
    if (!token) {
      this.disconnectUser(socket);
      return;
    }

    const isValid = await AuthManager.getInstance()
      .getAuth()
      ?.validateSession(token);
    if (!isValid) this.disconnectUser(socket);
  };

  public static disconnectUser = (socket: WebSocket) => {
    console.log('Disconnecting user!');
    socket.emit('error', { status: 0, message: 'Unauthorize user!' });
    socket.terminate();
  };
}
