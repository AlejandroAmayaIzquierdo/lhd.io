class Player {
  public userID: string = '';

  private x: number = 0;
  private y: number = 0;

  public constructor(userID: string, x?: number, y?: number) {
    this.userID = userID;
    if (x && y) this.move(x, y);
    else this.move(0, 0);
  }

  public move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getPosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export default Player;
