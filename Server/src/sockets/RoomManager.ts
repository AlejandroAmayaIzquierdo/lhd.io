import { Db } from '../database/dbConnection.js';
import { Room } from './Room.js';
import { Socket as socketIO } from 'socket.io';
import { SocketHandler } from './Sockets.js';

export class RoomManager {
  public static rooms: Room[] = [];

  public static joinRoom = async (
    socket: socketIO,
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
          socket.join(isRoomCreated.getID());
          isRoomCreated.join({ ...user, SocketId: socket.id });
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

  public static isSocketOnAnyRoom = (socketID: string) => {
    return RoomManager.rooms.find((e) => {
      const users = e.getPlayers();

      return users.find((j) => {
        return j.SocketId === socketID;
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
    socket: socketIO,
    roomID: string,
    user: Api.User,
  ) => {
    console.log('CreatingRoom');
    const room = new Room(roomID, [{ ...user, SocketId: socket.id }]);
    socket.join(`${roomID}`);
    room.join({ ...user, SocketId: socket.id });

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
