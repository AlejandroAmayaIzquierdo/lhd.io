import { Player } from "../entity/player";
import { Game } from "../Game";

export class GameScene implements GAME.Scene {
  public id: string = "GameScene";

  public static readonly MAP_WIDTH = 20;
  public static readonly MAP_HEIGHT = 20;
  public static readonly BORDER_WIDTH = 64;

  public static users: any[] = [];

  public constructor() {
    this.load();
    Game.context.scene(this.id, this.init);
    Game.context.go(this.id);
  }

  public load(): void {
    // Game.context.loadSprite("bean", "bean.png");
  }

  public init(): void {
    const k = Game.context;
    const player = Player.getInstance();
    player.obj.onUpdate(GameScene.update);

    Game.context.onKeyDown("a", () => {
      player.obj.move(-Player.SPEED, 0);
    });
    Game.context.onKeyDown("d", () => {
      player.obj.move(Player.SPEED, 0);
    });
    Game.context.onKeyDown("s", () => {
      player.obj.move(0, Player.SPEED);
    });
    Game.context.onKeyDown("w", () => {
      player.obj.move(0, -Player.SPEED);
    });

    GameScene.buildLevel();

    Game.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as { e: number; d: unknown };

      switch (data.e) {
        case 0:
          const { players } = data.d as GAME.PayLoadUpdateEvent;

          for (const playerData of players) {
            console.log(playerData.userID);
            const existingPlayer = GameScene.users.find(
              (user) => user.userID === playerData.userID
            );

            if (!existingPlayer) {
              const newPlayer = k.add([
                k.sprite("SlimeIdle", { anim: "idle" }),
                k.scale(5),
                k.pos(playerData.x, playerData.y),
                k.anchor("center"),
              ]) as any;
              newPlayer.userID = playerData.userID;

              const label = k.add([
                k.text(`${playerData.userID}`.split("-")[0]),
                k.pos(newPlayer.pos.x, newPlayer.pos.y - 200),
                k.anchor("center"),
              ]);
              newPlayer.label = label;
              GameScene.users.push(newPlayer);
            } else {
              existingPlayer.pos.x = playerData.x;
              existingPlayer.pos.y = playerData.y;

              existingPlayer.label.pos.x =
                playerData.x + existingPlayer.width / 2;
              existingPlayer.label.pos.y = playerData.y - 20;
            }
          }

          GameScene.users.forEach((existingPlayer) => {
            const playerStillInRoom = players.find(
              (players) => players.userID === existingPlayer.userID
            );
            if (!playerStillInRoom) {
              k.destroy(existingPlayer.label);
              k.destroy(existingPlayer); // Remove player from game
              GameScene.users.splice(
                GameScene.users.indexOf(existingPlayer),
                1
              );
            }
          });

          break;
        default:
          break;
      }
    });
  }

  public static buildLevel() {
    const topBorder = "=".repeat(GameScene.MAP_WIDTH + 2);
    const middleSpace = `=${" ".repeat(GameScene.MAP_WIDTH)}=`;
    const bottomBorder = "=".repeat(GameScene.MAP_WIDTH + 2);

    const mapDefinition = [topBorder];

    for (let i = 0; i < GameScene.MAP_HEIGHT; i++) {
      mapDefinition.push(middleSpace);
    }

    mapDefinition.push(bottomBorder);

    const k = Game.context;

    k.addLevel(mapDefinition, {
      tileHeight: GameScene.BORDER_WIDTH,
      tileWidth: GameScene.BORDER_WIDTH,
      pos: k.vec2(-GameScene.BORDER_WIDTH / 2, -GameScene.BORDER_WIDTH / 2),
      tiles: {
        "": () => [],
        "=": () => [
          k.rect(GameScene.BORDER_WIDTH, GameScene.BORDER_WIDTH),
          k.color(255, 255, 255),
        ],
      },
    });
  }

  public static update = () => {
    const k = Game.context;
    const playerInstance = Player.getInstance();
    const player = playerInstance.obj;

    if (player.pos.x < GameScene.BORDER_WIDTH) {
      player.pos.x = GameScene.BORDER_WIDTH;
    }
    if (player.pos.x > GameScene.MAP_WIDTH * GameScene.BORDER_WIDTH) {
      player.pos.x = GameScene.MAP_WIDTH * GameScene.BORDER_WIDTH;
    }
    if (player.pos.y < GameScene.BORDER_WIDTH) {
      player.pos.y = GameScene.BORDER_WIDTH;
    }
    if (player.pos.y > GameScene.MAP_HEIGHT * GameScene.BORDER_WIDTH) {
      player.pos.y = GameScene.MAP_HEIGHT * GameScene.BORDER_WIDTH;
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
    };

    if (
      visibleArea.height !== playerInstance.prevVisibleArea.height ||
      visibleArea.width !== playerInstance.prevVisibleArea.width
    ) {
      console.log("visible area change");
      emitData = { ...emitData, visibleArea };
      playerInstance.prevVisibleArea = visibleArea;
    }

    Game.socket.send(JSON.stringify({ e: 1, d: emitData }));
  };
}
