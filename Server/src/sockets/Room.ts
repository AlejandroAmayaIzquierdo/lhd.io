import Game from '@/game/Game.js';
import { Db } from '../database/dbConnection.js';
import { Application } from '../index.js';
import { RoomManager } from './RoomManager.js';

export class Room {
  private id: string;

  private usersInfo: Api.User[] = [];

  private interval: NodeJS.Timeout | undefined;

  private startedAt: string = '';

  private game: Game;

  public static readonly MAX_TIME_BY_ROOM: number = 1800; // 30 minutes
  public static readonly MAX_USER: number = 2;

  public constructor(roomID: string, players?: Api.User[]) {
    this.id = `${roomID}`;

    if (players) this.usersInfo = [...this.usersInfo, ...players];

    this.startedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    this.game = new Game();

    this.startRoom();
  }

  public join = async (user: Api.User) => {
    const isUserOnRoom = this.usersInfo.find((e) => e.userId === user.userId);
    if (!isUserOnRoom) this.usersInfo.push(user);
    Application.io.to(this.id).emit('joinedRoom', this.usersInfo);

    this.game.spawnPlayer(user.userId, 0, 0);

    console.log('User joined', user.userId);

    if (!this.interval) this.handle();
  };

  private startRoom = async () => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    await Db.getInstance().query(
      `UPDATE rooms SET isActive=1,startedAt="${formattedDate}" WHERE id='${this.id}'`,
    );
  };

  public leave = async (user: Api.User) => {
    console.log('User left', user.userId);

    this.usersInfo = this.usersInfo.filter((e) => e.userId !== user.userId);
    this.game.destroyPlayer(user.userId);
    Application.io.to(this.id).emit('leavedRoom', user);

    // if (this.usersInfo.length <= 1) this.done();
  };

  public handle = () => {
    this.interval = setInterval(async () => {
      Application.io.to(this.id).emit('updateRoom', this.game.getGameData());
    }, 1000 / 60);
  };

  public isDone = () => {
    //TODO condition to close room
    const now = new Date();
    const startDate = new Date(this.startedAt);
    const diff = now.getTime() - startDate.getTime();
    const seconds = diff / 1000;
    return seconds > Room.MAX_TIME_BY_ROOM;
  };

  public done = async () => {
    if (this.interval) clearInterval(this.interval);
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    await Db.getInstance().query(
      `UPDATE rooms SET users="${this.usersInfo
        .map((e) => e.userId)
        .join(
          ',',
        )}",isActive=0,isEnded=1,endedAt="${formattedDate}" WHERE id="${
        this.id
      }"`,
    );
    RoomManager.removeRoom(this.id);
  };

  public static doesRoomShouldEnd = async (
    room: Api.Room,
  ): Promise<boolean> => {
    try {
      const { createdAt } = room;

      const now = new Date();
      const startDate = new Date(createdAt);
      const diff = now.getTime() - startDate.getTime();
      const seconds = diff / 1000;
      return seconds > Room.MAX_TIME_BY_ROOM;
    } catch (err) {
      return true;
    }
  };

  public getID = () => this.id;
  public getPlayers = () => this.usersInfo;
  public getGame = () => this.game;
}
