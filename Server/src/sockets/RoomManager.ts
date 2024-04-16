import { Db } from '../database/dbConnection.js';
import { Room } from './Room.js';
import { SocketHandler } from './Sockets.js';

import WebSocket from 'ws';

export class RoomManager {
  public static rooms: Room[] = [];

  public static joinRoom = async (
    socket: WebSocket,
    roomID: string,
    user: Api.User,
  ) => {
    try {
      if (!roomID || !user) throw new Error('Invalid data');

      const query = (await Db.getInstance().query(
        `select id,isEnded,isPrivate,maxUsers from rooms where id ='${roomID}'`,
      )) as Api.Room[];

      if (query.length > 0 || query.length < 2) {
        if (query[0].isEnded === 1) socket.emit('joinedRoom', false);

        const isRoomCreated = this.rooms.find((e) => e.getID() === roomID);
        if (isRoomCreated) {
          console.log('Room already created');
          isRoomCreated.join({ ...user, socket: socket });
          console.log(isRoomCreated);
        } else {
          console.log('Room not created');
          this.createRoom(socket, roomID, user);
        }
      } else {
        socket.emit('joinedRoom', false);
      }
    } catch (err) {
      console.log(err);
      SocketHandler.disconnectUser(socket);
    }
  };

  public static isUserOnAnyRoom = (userID: string) => {
    return RoomManager.rooms.find((e) => {
      const users = e.getPlayers();

      return users.find((j) => j.userId === userID);
    });
  };

  public static isSocketOnAnyRoom = (socket: WebSocket) => {
    return RoomManager.rooms.find((e) => {
      const users = e.getPlayers();

      return users.find((j) => {
        return j.socket === socket;
      });
    });
  };

  public static removeRoom(roomID: string) {
    const index = this.rooms.findIndex((room) => room.getID() === roomID);
    if (index !== -1) {
      this.rooms.splice(index, 1);
    }
  }

  private static createRoom = async (
    socket: WebSocket,
    roomID: string,
    user: Api.User,
  ) => {
    console.log('CreatingRoom');
    const room = new Room(roomID, [{ ...user, socket }]);

    room.join({ ...user, socket });

    this.rooms.push(room);
  };

  public static getRoomById = (roomID: string) => {
    for (let i = 0; i < this.rooms.length; i++) {
      const element = this.rooms[i];
      if (element.getID() === roomID) {
        return element;
      }
    }
    return undefined;
  };
}
