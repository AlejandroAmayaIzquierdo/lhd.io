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

      const audioIcon = document.getElementById(
        "audioIcon"
      ) as HTMLInputElement;

      audioIcon.style["opacity"] = "100";
      audioIcon.style["display"] = "block";

      audioIcon.addEventListener("click", function () {
        GameScene.isMute = !GameScene.isMute;
        audioIcon.src = GameScene.isMute
          ? "/audio-off-svgrepo-com.svg"
          : "/audio-svgrepo-com.svg";
      });
    });
});
