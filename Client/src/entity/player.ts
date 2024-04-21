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

    k.loadSpriteAtlas("Slime/idle.png", {
      SlimeIdle: {
        x: 0,
        y: 0,
        width: 64,
        height: 14,
        sliceX: 4,
        sliceY: 1,
        anims: {
          idle: {
            from: 0,
            to: 3,
            speed: 4,
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
      k.sprite("SlimeIdle", { anim: "idle" }),
      k.pos(initPos?.x ?? 100, initPos?.y ?? 100),
      k.z(1),
      k.scale(5),
      k.anchor("center"),
      k.area({ shape: new k.Rect(new k.Vec2(0, 0), 64 / 5, 64 / 5) }),
      k.body(),
    ]);

    this.prevVisibleArea = { width: k.width(), height: k.height() };
  }

  public getPosition = () => {
    const { x, y } = this.obj.pos;
    return { x, y };
  };

  public static getInstance(): Player {
    if (!Player.instance) Player.instance = new Player();
    return Player.instance;
  }
}
