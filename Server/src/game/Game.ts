import Player from './Player.js';

class Game {
  private players: Player[];

  public constructor() {
    this.players = [];
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

  public movePlayer = (userID: string, x: number, y: number) => {
    const p = this.players.find((e) => e.userID === userID);
    p?.move(x, y);
  };

  public getPlayer = (id: string) => this.players.find((e) => e.userID === id);
}

export default Game;
