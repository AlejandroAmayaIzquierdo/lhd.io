export class LuckyBox implements Game.Entity {
  public x: number;
  public y: number;

  constructor() {
    this.x = Math.random() * 10;
    this.y = Math.random() * 10;
  }

  public onCollide(other: unknown) {
    console.log(other);
  }
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
