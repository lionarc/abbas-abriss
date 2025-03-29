import Phaser from "phaser";

export default class NameEntryScene extends Phaser.Scene {
  constructor() {
    super("NameEntryScene");
    this.playerNames = ["Spieler 1", "Spieler 2"];
    this.currentPlayer = 0;
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0000aa)
      .setOrigin(0, 0)
      .setAlpha(0.3);
    
    // Title
    this.titleText = this.add.text(
      this.scale.width / 2,
      50,
      "Wie heißt Spieler 1?",
      {
        font: "bold 28px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Create name input field (visual representation)
    const inputBox = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2 - 20,
      300,
      50,
      0xffffff
    ).setAlpha(0.8);
    
    this.nameText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 20,
      "",
      {
        font: "24px Arial",
        fill: "#000000",
        align: "center"
      }
    ).setOrigin(0.5);
    
    // Cursor effect for input field
    this.cursorRect = this.add.rectangle(
      this.scale.width / 2 - 140 + this.nameText.width,
      this.scale.height / 2 - 20,
      3,
      30,
      0x000000
    ).setOrigin(0, 0.5);
    
    // Blink cursor
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.cursorRect.visible = !this.cursorRect.visible;
      },
      loop: true
    });
    
    // Instruction text
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 50,
      "Gib deinen Namen ein und drücke ENTER",
      {
        font: "16px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    
    // Confirm button
    const confirmButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2 + 110,
      200,
      50,
      0x00aa00
    ).setInteractive();
    
    this.confirmText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 110,
      "Bestätigen (ENTER)",
      {
        font: "bold 16px Arial",
        fill: "#ffffff"
      }
    ).setOrigin(0.5);
    
    // Button effects
    confirmButton.on("pointerover", () => confirmButton.fillColor = 0x00cc00);
    confirmButton.on("pointerout", () => confirmButton.fillColor = 0x00aa00);
    confirmButton.on("pointerdown", () => confirmButton.fillColor = 0x009900);
    confirmButton.on("pointerup", () => this.confirmName());
    
    // Setup keyboard input
    this.input.keyboard.on("keydown", this.handleKeyInput, this);
  }
  
  handleKeyInput(event) {
    // Get the current input value
    let name = this.nameText.text;
    
    // Handle different key inputs
    if (event.keyCode === 8) { // Backspace
      // Remove the last character
      if (name.length > 0) {
        name = name.substr(0, name.length - 1);
      }
    } else if (event.keyCode === 13) { // Enter
      // Confirm the name
      this.confirmName();
      return;
    } else if ((event.keyCode >= 65 && event.keyCode <= 90) || // A-Z
              (event.keyCode >= 97 && event.keyCode <= 122) || // a-z
              (event.keyCode >= 48 && event.keyCode <= 57) || // 0-9
              event.keyCode === 32) { // Space
      // Add the character if name is not too long
      if (name.length < 15) {
        name += event.key;
      }
    }
    
    // Update the text display
    this.nameText.setText(name);
    
    // Update cursor position
    this.cursorRect.x = this.scale.width / 2 - 140 + this.nameText.width + 5;
  }
  
  confirmName() {
    // Store the entered name
    const enteredName = this.nameText.text.trim();
    if (enteredName.length > 0) {
      this.playerNames[this.currentPlayer] = enteredName;
    }
    
    // Move to next player or start game
    this.currentPlayer++;
    if (this.currentPlayer < 2) {
      // Reset for player 2 input
      this.nameText.setText("");
      this.cursorRect.x = this.scale.width / 2 - 140;
      this.titleText.setText(`Wie heißt Spieler 2?`);
    } else {
      // Start the game with both player names
      this.scene.start("GameScene", { playerNames: this.playerNames });
    }
  }
}
