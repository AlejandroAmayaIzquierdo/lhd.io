import kaboom, { KaboomCtx } from "kaboom";
import { DisconnectedScene } from "./scenes/DisconectedScene";
declare const __DEV__: boolean;

export class Game {
  public static context: KaboomCtx;

  public static readonly WS_HOST = __DEV__
    ? "ws://localhost:3000"
    : "ws://200.234.226.115:3000";

  public static socket: WebSocket;
  public scene: GAME.Scene | undefined;

  public static userID: string = "";

  public constructor(k: KaboomCtx, playerName: string) {
    Game.context = k;
    Game.socket = new WebSocket(Game.WS_HOST);

    this.connectToServer({ playerName });

    Game.socket.addEventListener("error", () => {
      this.changeScene(new DisconnectedScene());
    });

    Game.socket.addEventListener("close", () => {
      this.changeScene(new DisconnectedScene());
    });

    const chatInput = document.getElementById("chatInput") as HTMLInputElement;

    chatInput.addEventListener("keypress", (event) =>
      this.sendChat(event, chatInput.value)
    );
  }

  public static StartGame = (playerName: string, debug?: boolean) => {
    const Kcontext = kaboom();
    if (debug) Kcontext.debug.inspect = true;
    return new Game(Kcontext, playerName);
  };

  public changeScene = (scene: GAME.Scene) => {
    this.scene = scene;
  };

  public connectToServer = (data: { playerName: string; roomID?: string }) => {
    Game.userID = `${data.playerName}-${Math.floor(Math.random() * 100)}`;
    const joinRoomData = {
      lang: "es",
      roomId: data.roomID ?? "main",
      userId: Game.userID,
      userName: data.playerName,
      private: false,
      visibleArea: {
        width: Game.context.width().toFixed(3),
        height: Game.context.height().toFixed(3),
      },
    };
    Game.socket.addEventListener("open", () => {
      Game.socket.send(JSON.stringify({ e: 0, d: joinRoomData }));
    });
  };

  public sendChat = (
    event: KeyboardEvent,
    message: string,
    roomID?: string
  ) => {
    if (event.key === "Enter") {
      Game.socket.send(JSON.stringify({ e: 2, d: message }));

      (document.getElementById("chatInput") as HTMLInputElement).value = "";
    }
  };

  public static appendChatMessage(message: string) {
    const chatList = document.getElementById("chatList");
    if (!chatList) return;

    const listItem = document.createElement("li");
    listItem.textContent = message;
    chatList.appendChild(listItem);

    // Automatically scroll to the bottom of the chatbox
    chatList.scrollTop = chatList.scrollHeight;
  }
}
