import { Game } from "../Game";

export class DisconnectedScene implements GAME.Scene {
  public id: string = "DisconectedScene";

  public constructor() {
    this.load();
    Game.context.scene(this.id, this.init);
    Game.context.go(this.id);
  }

  public load(): void {}

  public init(): void {
    const k = Game.context;
    k.add([
      k.text("Diconected from the server, please refresh the page", {
        size: k.width() * 0.03,
      }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.fixed(),
    ]);
  }
}
