class Player {
  public userID: string = '';

  private x: number = 0;
  private y: number = 0;

  private visibleArea: App.VisibleArea;

  private visibleRadius: number = 0;

  public constructor(
    userID: string,
    visibleArea: App.VisibleArea,
    x?: number,
    y?: number,
  ) {
    this.userID = userID;
    if (x && y) this.move(x, y);
    else this.move(0, 0);

    this.visibleArea = visibleArea;
    const diagonalLength = Math.sqrt(
      this.visibleArea.width ** 2 + this.visibleArea.height ** 2,
    );
    const radius = diagonalLength / 2;
    this.visibleRadius = radius;
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

  public getVisibleArea(): number {
    return this.visibleRadius;
  }

  public setVisibleArea(area: App.VisibleArea) {
    this.visibleArea = area;
  }
}

export default Player;
