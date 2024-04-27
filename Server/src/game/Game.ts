import { LuckyBox } from './LuckyBox.js';
import Player from './Player.js';

class Game {
  private players: Player[];

  private entities: Game.Entity[] = [];

  public static readonly MAX_ENTITIES_BY_GAME = 20;

  public constructor() {
    this.players = [];

    for (let i = 0; i < Game.MAX_ENTITIES_BY_GAME; i++) {
      this.entities.push(new LuckyBox());
    }
  }

  public spawnPlayer = (
    userID: string,
    visibleArea: App.VisibleArea,
    x: number,
    y: number,
  ) => {
    this.players.push(new Player(userID, visibleArea, x, y));
  };

  public destroyPlayer = (userID: string) => {
    this.players = this.players.filter((e) => e.userID !== userID);
  };

  public getGameData() {
    return {
      players: this.players,
    };
  }

  public movePlayer = (
    userID: string,
    x: number,
    y: number,
    rock?: { x: number; y: number },
  ) => {
    const p = this.players.find((e) => e.userID === userID);
    p?.move(x, y);
    if (rock) p?.moveRock(rock?.x, rock?.y);
  };

  public getPlayer = (id: string) => this.players.find((e) => e.userID === id);
  public getPlayers = () => this.players;
  public getEntities = () => this.entities;
}

export default Game;
