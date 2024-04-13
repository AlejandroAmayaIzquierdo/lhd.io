import Player from './Player.js';

class Game {
  private players: Player[];

  public constructor() {
    this.players = [];
  }

  public spawnPlayer = (userID: string, x: number, y: number) => {
    this.players.push(new Player(userID, x, y));
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
}

export default Game;
