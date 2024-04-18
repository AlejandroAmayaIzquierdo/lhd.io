import Game from '@/game/Game.js';
import { Db } from '../database/dbConnection.js';
import { RoomManager } from './RoomManager.js';

export class Room {
  private id: string;

  private usersInfo: Api.User[] = [];

  private interval: NodeJS.Timeout | undefined;

  private startedAt: string = '';

  private game: Game;

  public static readonly MAX_TIME_BY_ROOM: number = 1800;
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
    // Application.io.to(this.id).emit('joinedRoom', this.usersInfo);

    if (user.visibleArea) this.game.spawnPlayer(user.userId, user.visibleArea, 0, 0);

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
    // Application.io.to(this.id).emit('leavedRoom', user);

    // if (this.usersInfo.length <= 1) this.done();
  };

  public handle = () => {
    this.interval = setInterval(async () => {
      const players = this.game.getPlayers();
      const entities = this.game.getEntities();
      this.usersInfo.forEach((user) => {
        if (!user.socket) return;

        const player = this.game.getPlayer(user.userId);
        const playerPosition = player?.getPosition(); // {x,y}
        const areaVisible = player?.getVisibleArea(); // radius

        if (!player || !areaVisible || !playerPosition) return;

        const userVisibleToPlayer = players.filter((otherPlayer) => {
          if (otherPlayer.userID === user.userId) return false; // Exclude current user

          const otherPlayerPosition = this.game
            .getPlayer(otherPlayer.userID)
            ?.getPosition();

          if (!otherPlayerPosition) return false;

          // distance between players
          const distance = Math.sqrt(
            Math.pow(playerPosition.x - otherPlayerPosition.x, 2) +
              Math.pow(playerPosition.y - otherPlayerPosition.y, 2),
          );

          // Check if otherPlayer is within the visible area of the current user
          return distance < areaVisible;
        });

        const entitiesVisible = entities.filter((entity) => {
          const entityPosition = entity.getPosition();

          if (!entityPosition) return false;

          // distance between players
          const distance = Math.sqrt(
            Math.pow(playerPosition.x - entityPosition.x, 2) +
              Math.pow(playerPosition.y - entityPosition.y, 2),
          );
          return distance < areaVisible;
        });

        user.socket.send(
          JSON.stringify({
            e: 0,
            d: { players: userVisibleToPlayer, entities: entitiesVisible },
          }),
        );
      });
    }, 1000 / 120);
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
        .join(',')}",isActive=0,isEnded=1,endedAt="${formattedDate}" WHERE id="${
        this.id
      }"`,
    );
    RoomManager.removeRoom(this.id);
  };

  public static doesRoomShouldEnd = async (room: Api.Room): Promise<boolean> => {
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
