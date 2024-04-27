import { GameScene } from "./scenes/GameScene";
import { Game } from "./Game";

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("startButton")
    ?.addEventListener("click", function () {
      const playerNameInput = document.getElementById(
        "playerNameInput"
      ) as HTMLInputElement;
      const playerName = playerNameInput.value;
      const debugInput = document.getElementById(
        "debugInput"
      ) as HTMLInputElement;

      const gameWrapper = document.getElementById(
        "chatbox"
      ) as HTMLInputElement;

      gameWrapper.style["display"] = "block";
      gameWrapper.style["opacity"] = "100";

      if (playerName && playerName.length > 0) {
        const g = Game.StartGame(playerName, debugInput.checked);
        g.changeScene(new GameScene());
      }
    });
});
