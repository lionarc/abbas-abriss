import Phaser from "phaser";

export default class EndGameScene extends Phaser.Scene {
  constructor() {
    super("EndGameScene");
  }

  init(data) {
    this.scores = data.scores || [0, 0];
    this.playerNames = data.playerNames || ["Spieler 1", "Spieler 2"];
  }

  preload() {
    this.load.image("trophy", "/assets/trophy.png");
    this.load.audio("victory", "/assets/sounds/victory.mp3");
  }

  create() {
    // Determine the winner
    let winnerIndex, winnerText;
    if (this.scores[0] > this.scores[1]) {
      winnerIndex = 0;
      winnerText = `${this.playerNames[0]} gewinnt!`;
    } else if (this.scores[1] > this.scores[0]) {
      winnerIndex = 1;
      winnerText = `${this.playerNames[1]} gewinnt!`;
    } else {
      winnerIndex = -1;
      winnerText = "Unentschieden!";
    }
    
    // Background based on winner
    let bgColor = 0x0066ff;
    if (winnerIndex === 0) {
      bgColor = 0x0000cc; // Blue for player 1
    } else if (winnerIndex === 1) {
      bgColor = 0xcc0000; // Red for player 2
    }
    
    // Create background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, bgColor)
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
    
    // Winner announcement
    const winnerTextObj = this.add.text(
      this.scale.width / 2,
      220,
      winnerText,
      {
        font: "bold 40px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Make winner text pulse
    this.tweens.add({
      targets: winnerTextObj,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Scores
    this.add.text(
      this.scale.width / 2,
      300,
      "Endergebnis:",
      {
        font: "bold 24px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Player 1 score
    this.add.text(
      this.scale.width / 2 - 100,
      350,
      `${this.playerNames[0]}: ${this.scores[0]}`,
      {
        font: "20px Arial",
        fill: "#0000ff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Player 2 score
    this.add.text(
      this.scale.width / 2 + 100,
      350,
      `${this.playerNames[1]}: ${this.scores[1]}`,
      {
        font: "20px Arial",
        fill: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Play again button
    const playAgainButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 150,
      250,
      60,
      0x00aa00
    ).setInteractive();
    
    this.add.text(
      this.scale.width / 2,
      this.scale.height - 150,
      "Nochmal spielen",
      {
        font: "bold 22px Arial",
        fill: "#ffffff"
      }
    ).setOrigin(0.5);
    
    // Button effects
    playAgainButton.on("pointerover", () => playAgainButton.fillColor = 0x00cc00);
    playAgainButton.on("pointerout", () => playAgainButton.fillColor = 0x00aa00);
    playAgainButton.on("pointerdown", () => playAgainButton.fillColor = 0x009900);
    playAgainButton.on("pointerup", () => this.scene.start("LogoScene"));
    
    // Back to title button
    const backButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 80,
      250,
      60,
      0x555555
    ).setInteractive();
    
    this.add.text(
      this.scale.width / 2,
      this.scale.height - 80,
      "Zurück zum Titel",
      {
        font: "bold 22px Arial",
        fill: "#ffffff"
      }
    ).setOrigin(0.5);
    
    // Button effects
    backButton.on("pointerover", () => backButton.fillColor = 0x777777);
    backButton.on("pointerout", () => backButton.fillColor = 0x555555);
    backButton.on("pointerdown", () => backButton.fillColor = 0x444444);
    backButton.on("pointerup", () => this.scene.start("LogoScene"));
    
    // Play victory sound
    try {
      this.sound.play("victory");
    } catch (error) {
      console.warn("Could not play victory sound:", error);
    }
  }
}
