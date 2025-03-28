import Phaser from "phaser";

export default class EndGameScene extends Phaser.Scene {
  constructor() {
    super("EndGameScene");
  }

  init(data) {
    this.scores = data.scores || [0, 0];
    this.playerNames = data.playerNames || ["Spieler 1", "Spieler 2"];
    this.completionTime = data.completionTime || 0;
    this.wasteCount = data.wasteCount || 0;
  }

  preload() {
    this.load.image("trophy", "/assets/trophy.png");
    this.load.audio("victory", "/assets/sounds/victory.mp3");
  }

  create() {
    // Format the completion time
    const minutes = Math.floor(this.completionTime / 60000);
    const seconds = Math.floor((this.completionTime % 60000) / 1000);
    const ms = Math.floor((this.completionTime % 1000) / 10);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    
    // Create background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0066ff)
      .setOrigin(0, 0)
      .setAlpha(0.4);
    
    // Celebration title
    this.add.text(
      this.scale.width / 2,
      50,
      "Balkonsanierung abgeschlossen!",
      {
        font: "bold 32px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5
      }
    ).setOrigin(0.5);
    
    // Trophy image (if available)
    try {
      const trophy = this.add.image(
        this.scale.width / 2,
        150,
        "trophy"
      ).setScale(0.2);
      
      // Make trophy shine
      this.tweens.add({
        targets: trophy,
        angle: { from: -5, to: 5 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.warn("Could not load trophy image:", error);
    }
    
    // Team time announcement
    const timeTextObj = this.add.text(
      this.scale.width / 2,
      220,
      `Team Zeit: ${formattedTime}`,
      {
        font: "bold 40px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Add waste penalty display
    this.add.text(
      this.scale.width / 2,
      280,
      `Zeitstrafe: +${this.wasteCount} Sekunden`,
      {
        font: "24px Arial",
        fill: "#ff9900",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Contributions header now about waste
    this.add.text(
      this.scale.width / 2,
      320,
      "Verschwendete Materialien:",
      {
        font: "bold 24px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Player 1 waste
    this.add.text(
      this.scale.width / 2 - 150,
      360,
      `${this.playerNames[0]}: ${this.scores[0]}`,
      {
        font: "20px Arial",
        fill: "#0000ff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Player 2 waste
    this.add.text(
      this.scale.width / 2 + 150,
      360,
      `${this.playerNames[1]}: ${this.scores[1]}`,
      {
        font: "20px Arial",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Display team total waste
    this.add.text(
      this.scale.width / 2,
      400,
      `Gesamt: ${this.wasteCount}`,
      {
        font: "bold 24px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Function to restart the game
    const restartGame = () => {
      // Add a small visual feedback before refreshing
      this.add.text(
        this.scale.width / 2,
        this.scale.height - 40,
        "Spiel wird neu gestartet...",
        {
          font: "18px Arial",
          fill: "#ffffff"
        }
      ).setOrigin(0.5);
      
      // Delay the refresh slightly to show the feedback
      this.time.delayedCall(500, () => {
        // Refresh the browser page to restart the game
        window.location.reload();
      });
    };
    
    // Play again button - larger and more prominent since it's the only button now
    const playAgainButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 100,
      300,
      70,
      0x00aa00
    ).setInteractive();
    
    this.add.text(
      this.scale.width / 2,
      this.scale.height - 100,
      "Nochmal spielen (ENTER)",
      {
        font: "bold 26px Arial",
        fill: "#ffffff"
      }
    ).setOrigin(0.5);
    
    // Button effects
    playAgainButton.on("pointerover", () => playAgainButton.fillColor = 0x00cc00);
    playAgainButton.on("pointerout", () => playAgainButton.fillColor = 0x00aa00);
    playAgainButton.on("pointerdown", () => playAgainButton.fillColor = 0x009900);
    
    // On button click, refresh the browser to restart the game
    playAgainButton.on("pointerup", restartGame);
    
    // Also allow Enter key to restart the game
    const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enterKey.on('down', restartGame);
    
    // Play victory sound
    try {
      this.sound.play("victory");
    } catch (error) {
      console.warn("Could not play victory sound:", error);
    }
  }
}
