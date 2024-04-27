// import { Vec2 } from "kaboom";
import { Game } from "../Game";

export class Player {
  public static readonly SPEED = 480;
  public name!: string;
  public prevVisibleArea: { width: number; height: number };

  private static instance: Player;

  public obj;

  constructor(name?: string, initPos?: { x: number; y: number }) {
    this.name = name || "Player";

    const k = Game.context;

    k.loadSpriteAtlas("PlayerSprite.png", {
      Player: {
        x: 0,
        y: 0,
        width: 36,
        height: 30,
        sliceX: 4,
        sliceY: 3,
        anims: {
          idle: {
            from: 0,
            to: 3,
            speed: 4,
            loop: true,
          },
          walk: {
            from: 4,
            to: 7,
            speed: 6,
            loop: true,
          },
          push: {
            from: 8,
            to: 11,
            speed: 6,
            loop: true,
          },
        },
      },
    });

    // k.loadSpriteAtlas("Slime/jump1.png", {
    //   SlimeJump1: {
    //     x: 0,
    //     y: 0,
    //     width: 126,
    //     height: 24,
    //     sliceX: 7,
    //     sliceY: 1,
    //     anims: {
    //       jump1: {
    //         from: 0,
    //         to: 6,
    //         speed: 5,
    //         loop: true,
    //       },
    //     },
    //   },
    // });
    this.obj = k.add([
      k.sprite("Player", { anim: "push" }),
      k.pos(initPos?.x ?? 0, initPos?.y ?? 0),
      k.z(1),
      k.scale(10),
      k.anchor("center"),
      k.area({ shape: new k.Rect(new k.Vec2(0, 0), 10, 10) }),
      k.body(),
    ]);

    this.obj.onKeyDown("a", () => {
      this.obj.flipX = true;
      if (this.obj.curAnim() !== "walk") this.obj.play("walk");
    });
    this.obj.onKeyDown("d", () => {
      this.obj.flipX = false;
      if (this.obj.curAnim() !== "walk") this.obj.play("walk");
    });

    this.obj.onUpdate(() => {
      if (!k.isKeyDown("a") && !k.isKeyDown("d") && !k.isKeyDown("space"))
        this.obj.play("idle");
    });

    this.prevVisibleArea = { width: k.width(), height: k.height() };
  }

  public getPosition = () => {
    const { x, y } = this.obj.pos;
    return { x, y };
  };

  public Jump = (force: number) => {
    this.obj.jump(Math.abs(force));
    // const dir = force > 0 ? 1 : -1;
    // this.obj.moveTo(10000 * dir, 0, 1000);
  };

  public static getInstance(): Player {
    if (!Player.instance) Player.instance = new Player();
    return Player.instance;
  }
}
