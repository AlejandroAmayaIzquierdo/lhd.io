import kaboom, { KaboomCtx } from "kaboom";
declare const __DEV__: boolean;

interface PlayerData {
  userID: number;
  x: number;
  y: number;
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("startButton")
    ?.addEventListener("click", function () {
      const playerNameInput = document.getElementById(
        "playerNameInput"
      ) as HTMLInputElement;
      const playerName = playerNameInput.value;
      loadGame(kaboom(), playerName);
    });
});

export const loadGame = (k: KaboomCtx, playerName: string) => {
  let WS_HOST = "ws://localhost:3000";
  if (!__DEV__) WS_HOST = "ws://200.234.226.115:3000";

  const socket = new WebSocket(WS_HOST);

  const user: number = Math.floor(Math.random() * 100);

  const users: any[] = [];

  let prevVisibleArea = {
    width: k.width(),
    height: k.height(),
  };

  const joinRoomData = {
    lang: "es",
    roomId: "main",
    userId: `${playerName}-${user}`,
    userName: playerName,
    private: false,
    visibleArea: {
      width: k.width().toFixed(3),
      height: k.height().toFixed(3),
    },
  };

  // k.debug.inspect = true;

  k.loadSprite("bean", "bean.png");
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
  k.loadSpriteAtlas("Slime/jump1.png", {
    SlimeJump1: {
      x: 0,
      y: 0,
      width: 126,
      height: 24,
      sliceX: 7,
      sliceY: 1,
      anims: {
        jump1: {
          from: 0,
          to: 6,
          speed: 5,
          loop: true,
        },
      },
    },
  });

  k.scene("main", () => {
    const SPEED: number = 480;
    const MAP_WIDTH = 20;
    const MAP_HEIGHT = 20;
    const BORDER_WIDTH = 64;

    // const player = k.add([k.sprite("bean"), k.pos(0, 0), k.z(1)]);

    let player = k.add([
      k.sprite("SlimeIdle", { anim: "idle" }),
      k.scale(5),
      k.pos(0, 0),
      k.z(1),
      k.anchor("center"),
    ]);

    k.add([
      k.sprite("SlimeJump1", { anim: "jump1" }),
      k.scale(5),
      k.pos(100, 100),
      k.z(1),
    ]);

    // player.onKeyDown("space", () => {
    //   // Remove the existing sprite component
    //   player;

    //   // Load a new sprite and add it to the player entity
    //   player.add([k.sprite("SlimeJump1", { anim: "jump1" })]);

    //   // Play the animation of the new sprite
    //   // player.play("jump1");
    // });

    k.setBackground(25, 27, 28);

    const topBorder = "=".repeat(MAP_WIDTH + 2);
    const middleSpace = `=${" ".repeat(MAP_WIDTH)}=`;
    const bottomBorder = "=".repeat(MAP_WIDTH + 2);

    const mapDefinition = [topBorder];

    for (let i = 0; i < MAP_HEIGHT; i++) {
      mapDefinition.push(middleSpace);
    }

    mapDefinition.push(bottomBorder);

    k.addLevel(mapDefinition, {
      tileHeight: BORDER_WIDTH,
      tileWidth: BORDER_WIDTH,
      pos: k.vec2(-BORDER_WIDTH / 2, -BORDER_WIDTH / 2),
      tiles: {
        "": () => [],
        "=": () => [k.rect(BORDER_WIDTH, BORDER_WIDTH), k.color(255, 255, 255)],
      },
    });

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ e: 0, d: joinRoomData }));

      player.onUpdate(() => {
        const visibleArea = {
          width: k.width(),
          height: k.height(),
        };
        let emitData: {
          userID: string;
          x: number;
          y: number;
          visibleArea?: { width: number; height: number };
        } = {
          userID: `${playerName}-${user}`,
          x: player.pos.x,
          y: player.pos.y,
        };

        if (
          visibleArea.height !== prevVisibleArea.height ||
          visibleArea.width !== prevVisibleArea.width
        ) {
          console.log("visible area change");
          emitData = { ...emitData, visibleArea };
          prevVisibleArea = visibleArea;
        }

        socket.send(JSON.stringify({ e: 1, d: emitData }));
      });
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as { e: number; d: unknown };

      switch (data.e) {
        case 0:
          const { players } = data.d as {
            players: PlayerData[];
            entities?: { x: number; y: number }[];
          };

          // console.log(entities);

          for (const playerData of players) {
            const existingPlayer = users.find(
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
              users.push(newPlayer);
            } else {
              existingPlayer.pos.x = playerData.x;
              existingPlayer.pos.y = playerData.y;

              existingPlayer.label.pos.x =
                playerData.x + existingPlayer.width / 2;
              existingPlayer.label.pos.y = playerData.y - 20;
            }
          }

          users.forEach((existingPlayer) => {
            const playerStillInRoom = players.find(
              (players) => players.userID === existingPlayer.userID
            );
            if (!playerStillInRoom) {
              k.destroy(existingPlayer.label);
              k.destroy(existingPlayer); // Remove player from game
              users.splice(users.indexOf(existingPlayer), 1);
            }
          });
          break;

        default:
          break;
      }
    });

    socket.addEventListener("error", (error) => {
      k.go("Diconected");
    });

    socket.addEventListener("close", () => {
      k.go("Diconected");
    });

    player.onUpdate(() => {
      // Prevent player from moving beyond the borders
      if (player.pos.x < BORDER_WIDTH / 2) {
        player.pos.x = BORDER_WIDTH / 2;
      }
      if (player.pos.x > (MAP_WIDTH - 0.4) * BORDER_WIDTH) {
        player.pos.x = (MAP_WIDTH - 0.4) * BORDER_WIDTH;
      }
      if (player.pos.y < BORDER_WIDTH / 2) {
        player.pos.y = BORDER_WIDTH / 2;
      }
      if (player.pos.y > (MAP_HEIGHT - 0.3) * BORDER_WIDTH) {
        player.pos.y = (MAP_HEIGHT - 0.3) * BORDER_WIDTH;
      }

      k.camPos(player.pos);
    });

    k.camPos(player.pos);

    k.onKeyDown("a", () => {
      player.move(-SPEED, 0);
    });

    k.onKeyDown("d", () => {
      player.move(SPEED, 0);
    });

    k.onKeyDown("w", () => {
      player.move(0, -SPEED);
    });

    k.onKeyDown("s", () => {
      player.move(0, SPEED);
    });
  });

  k.scene("Diconected", () => {
    k.setBackground(25, 27, 28);

    k.add([
      k.text("Diconected from the server, please refresh the page", {
        size: k.width() * 0.03,
      }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.fixed(),
    ]);
  });

  k.go("main");
};
