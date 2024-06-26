import {
  AnchorComp,
  AreaComp,
  BodyComp,
  GameObj,
  PosComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
  ZComp,
} from "kaboom";
import { Player } from "../entity/player";
import { Game } from "../Game";

export class GameScene implements GAME.Scene {
  public id: string = "GameScene";

  public static readonly MAP_WIDTH = 20;
  public static readonly MAP_HEIGHT = 20;
  public static readonly BORDER_WIDTH = 64;

  public static readonly ROCK_SPEED = 50;

  public static users: any[] = [];

  public static music = new Audio("/Duster-Me and the birds.mp3");

  public static isMute = false;

  private static rock:
    | GameObj<
        | SpriteComp
        | PosComp
        | ZComp
        | ScaleComp
        | AnchorComp
        | AreaComp
        | BodyComp
        | RotateComp
      >
    | undefined;

  private isPushing = false;

  public constructor() {
    this.load();
    Game.context.scene(this.id, this.init);
    Game.context.go(this.id);
  }

  public load(): void {
    Game.context.loadSprite("Rock", "Rock.png");
    Game.context.loadSprite("Ramp", "Ramp.png");
    // Game.context.loadSprite("PlayerPush", "PlayerPush.png");
  }

  public init(): void {
    const k = Game.context;
    const player = Player.getInstance();
    player.obj.onUpdate(GameScene.update);

    GameScene.rock = k.add([
      k.sprite("Rock"),
      k.pos(950, -20),
      k.z(0),
      k.anchor("center"),
      k.scale(10),
      k.body({ isStatic: true }),
      k.area({ shape: new k.Rect(new k.Vec2(0, 0), 15, 15) }),
      k.rotate(63.5),
    ]);

    GameScene.rock.onUpdate(() => {
      if (GameScene.rock && GameScene.rock?.pos.y < -5400) {
        GameScene.rock.angle = 0;
      }
    });

    Game.context.onKeyDown("a", () => {
      player.obj.move(-Player.SPEED, 0);
    });
    Game.context.onKeyDown("d", () => {
      player.obj.move(Player.SPEED, 0);
    });

    Game.context.onKeyDown("space", () => {
      if (GameScene?.rock?.isColliding(player.obj)) {
        this.isPushing = true;
        if (!GameScene.isMute) GameScene.music.play();
        const p = Player.getInstance().obj;
        if (p.curAnim() !== "push") p.play("push");
        if (GameScene.rock?.pos.y > -5450)
          GameScene?.rock.move(GameScene.ROCK_SPEED, -GameScene.ROCK_SPEED / 2);
        else GameScene?.rock.move(GameScene.ROCK_SPEED, 0);
      }
    });

    Game.context.onKeyRelease("space", () => {
      this.isPushing = false;
      GameScene.music.pause();
      GameScene.music.currentTime = 0;
    });

    k.setBackground(195, 101, 34);

    GameScene.buildLevel();

    k.setGravity(3000);

    GameScene.onMessage();
  }

  public static onMessage = () => {
    const k = Game.context;
    Game.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as { e: number; d: unknown };

      switch (data.e) {
        case 0:
          const { players } = data.d as GAME.PayLoadUpdateEvent;

          for (const playerData of players) {
            const existingPlayer = GameScene.users.find(
              (user) => user.userID === playerData.userID
            );

            if (!existingPlayer) {
              const newPlayer = k.add([
                k.sprite("Player", { anim: "idle" }),
                k.scale(10),
                k.pos(playerData.x, playerData.y),
                k.anchor("center"),
              ]) as any;
              newPlayer.userID = playerData.userID;

              const label = k.add([
                k.text(`${playerData.userID}`.split("-")[0]),
                k.pos(newPlayer.pos.x, newPlayer.pos.y - 200),
                k.anchor("center"),
              ]);
              const rock = k.add([
                k.sprite("Rock"),
                k.pos(950, -20),
                k.z(-1),
                k.anchor("center"),
                k.scale(10),
                k.rotate(63.5),
              ]);
              newPlayer.label = label;
              newPlayer.rock = rock;
              GameScene.users.push(newPlayer);
            } else {
              existingPlayer.pos.x = playerData.x;
              existingPlayer.pos.y = playerData.y;

              existingPlayer.label.pos.x =
                playerData.x + existingPlayer.width / 2;
              existingPlayer.label.pos.y = playerData.y - 20;

              existingPlayer.rock.pos.x = playerData.rock.x;
              existingPlayer.rock.pos.y = playerData.rock.y;
            }
          }

          GameScene.users.forEach((existingPlayer) => {
            const playerStillInRoom = players.find(
              (players) => players.userID === existingPlayer.userID
            );
            if (!playerStillInRoom) {
              k.destroy(existingPlayer.label);
              k.destroy(existingPlayer.rock);
              k.destroy(existingPlayer);
              GameScene.users.splice(
                GameScene.users.indexOf(existingPlayer),
                1
              );
            }
          });

          break;
        case 1:
        case 2:
          Game.appendChatMessage(data.d as string);
          break;
        default:
          break;
      }
    });
  };

  public static buildLevel() {
    const k = Game.context;

    k.add([
      k.rect(k.width() * 2, k.height()),
      k.area(),
      k.pos(0, 100),
      k.body({ isStatic: true }),
      k.color(35, 16, 0),
    ]);

    k.add([
      k.text("Press SPACE to push the rock"),
      k.pos(100, 100), // Adjust position as needed
      k.scale(2), // Adjust scale as needed
      k.color(255, 255, 255), // Adjust color as needed
    ]);
    GameScene.addRamp(900, 100, k.height(), 6150, 63.5);
    GameScene.addRamp(6300, -2595, k.height(), 6150, 63.5);
    k.add([
      k.rect(k.width() * 2, k.height()),
      k.area(),
      k.pos(11805, -5340),
      k.anchor("topleft"),
      k.body({ isStatic: true }),
      k.color(35, 16, 0),
    ]);
  }

  private static addRamp(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  ) {
    const k = Game.context;
    const ramp = k.add([
      k.rect(width, height),
      k.pos(x, y),
      k.color(35, 16, 0), // Adjust color as needed
      k.area(),
      k.z(-1),
      k.body({ isStatic: true }),
      k.anchor("botleft"),
      k.rotate(rotation), // Adjust angle of the ramp
    ]);

    for (let i = 0; i < 10; i++) {
      k.add([
        k.sprite("Ramp"),
        k.pos(x + 540 * i, y - 270 * i),
        k.z(10 * i),
        k.anchor("botleft"),
        k.scale(10),
        k.rotate(0),
      ]);
    }
    return ramp;
  }

  public static update = () => {
    const k = Game.context;
    const playerInstance = Player.getInstance();
    const player = playerInstance.obj;

    if (player.pos.x < GameScene.BORDER_WIDTH) {
      player.pos.x = GameScene.BORDER_WIDTH;
    }

    if (player.pos.x > 13400) {
      player.pos.x = 13400;
    }

    k.camPos(player.pos);

    const visibleArea = {
      width: k.width(),
      height: k.height(),
    };

    let emitData: GAME.EmitUserData = {
      userID: Game.userID,
      x: player.pos.x,
      y: player.pos.y,
      rock: {
        x: this.rock?.pos.x ?? 0,
        y: this.rock?.pos.y ?? 0,
      },
    };

    if (
      visibleArea.height !== playerInstance.prevVisibleArea.height ||
      visibleArea.width !== playerInstance.prevVisibleArea.width
    ) {
      emitData = { ...emitData, visibleArea };
      playerInstance.prevVisibleArea = visibleArea;
    }
    if (Game.socket.readyState === Game.socket.OPEN)
      Game.socket.send(JSON.stringify({ e: 1, d: emitData }));
  };
}
