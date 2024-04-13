import { io, Socket } from "socket.io-client";
import k from "./Kaboom.js";

interface PlayerData {
  userID: number;
  x: number;
  y: number;
}

const socket: Socket = io(`http://localhost:3000`);

const user: number = Math.floor(Math.random() * 100);

const users: any[] = [];

const joinRoomData = {
  lang: "es",
  roomId: "main",
  userId: user,
  userName: user,
  private: false,
};

console.log(joinRoomData);
socket.emit("joinRoom", joinRoomData);

k.loadSprite("bean", "bean.png");
const SPEED: number = 350;

// Add player game object
const player = add([sprite("bean"), pos(0, 0)]) as any;

socket.on("updateRoom", (data: { players: PlayerData[] }) => {
  const playersData: PlayerData[] = data.players;

  // Iterate through each player in the room
  for (const playerData of playersData) {
    const existingPlayer = users.find(
      (user) => user.userID === playerData.userID
    );

    // If player is not already mounted, add them to the game
    if (!existingPlayer) {
      const newPlayer = add([
        sprite("bean"),
        pos(playerData.x, playerData.y), // Set initial position from server data
      ]) as any;
      newPlayer.userID = playerData.userID;
      users.push(newPlayer);
    } else {
      // Update position of existing player
      existingPlayer.pos.x = playerData.x;
      existingPlayer.pos.y = playerData.y;
    }
  }

  // Check for players that have left the room
  users.forEach((existingPlayer) => {
    const playerStillInRoom = playersData.find(
      (playerData) => playerData.userID === existingPlayer.userID
    );
    if (!playerStillInRoom) {
      destroy(existingPlayer); // Remove player from game
      users.splice(users.indexOf(existingPlayer), 1); // Remove player from array
    }
  });
});

onKeyDown("a", () => {
  player.move(-SPEED, 0);
});

onKeyDown("d", () => {
  player.move(SPEED, 0);
});

onKeyDown("w", () => {
  player.move(0, -SPEED);
});

onKeyDown("s", () => {
  player.move(0, SPEED);
});

player.onUpdate(() => {
  socket.emit("updatePosition", {
    roomID: "main",
    userID: user,
    x: player.pos.x,
    y: player.pos.y,
  });
});
