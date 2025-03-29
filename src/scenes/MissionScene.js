import Phaser from "phaser";

export default class MissionScene extends Phaser.Scene {
  constructor() {
    super("MissionScene");
  }

  preload() {
    this.load.image("mission_bg", "/assets/mission.png");
    this.load.image("balcony", "/assets/coffee.png");
  }

  create() {
    // Background
    try {
      this.add.image(0, 0, "mission_bg")
        .setOrigin(0, 0)
        .setDisplaySize(this.scale.width, this.scale.height);
    } catch (error) {
      console.warn("Could not load mission background:", error);
      // Fallback background
      this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x333333)
        .setOrigin(0, 0);
    }
    
    // Mission title
    this.add.text(
      this.scale.width / 2,
      50,
      "BALKONSANIERUNG",
      {
        font: "bold 32px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Mission description
    const missionText = [
      "Der Balkon an der P3 ist in einem katastrophalen Zustand!",
      "Ein Wasserschaden wurde detektiert, sehr lange von der Verwaltung ignoriert,",
        "aber nun ist es an euch, Abbas Abriss, den Balkon zu reparieren.",
      "",
      "Eure Aufgabe im Team:",
      "• Zerschlagt die Fliesen, die nach und nach morsch erscheinen",
      "• Achtung, das kostet Energie!",
      "• Spieler 1 kann nur Holz holen (3 Stück pro Lauf) - für Balkenreparaturen",
      "• Spieler 2 kann nur Fliesen holen (4 Stück pro Lauf) - für neue Böden",
        "Habt ihr zu viel Material, müsst ihr es wegwerfen. Achtung, das kommt auf die Zeit obendrauf",
      "• Zusammen müsst ihr alle Fliesen reparieren - die Zeit wird gestoppt!",
      "• Achtet auf eure Energie, sammelt Kaffee für einen 20-Sekunden-Boost",
      "",
      "Arbeitet als Team zusammen, um den Balkon möglichst schnell zu sanieren!"
    ].join("\n");
    
    const textBox = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      missionText,
      {
        font: "18px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: this.scale.width - 200 }
      }
    ).setOrigin(0.5);
    
    // Try to add a balcony image
    try {
      this.add.image(this.scale.width / 2, this.scale.height - 120, "balcony")
        .setOrigin(0.5, 1)
        .setScale(0.5);
    } catch (error) {
      console.warn("Could not load balcony image:", error);
    }
    
    // Function to continue to name entry
    const startNameEntry = () => {
      this.scene.start("NameEntryScene");
    };
    
    // Accept mission button
    const acceptButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 60,
      200,
      50,
      0x00aa00
    ).setInteractive();
    
    this.add.text(
      this.scale.width / 2,
      this.scale.height - 60,
      "Auftrag annehmen (ENTER)",
      {
        font: "bold 16px Arial",
        fill: "#ffffff"
      }
    ).setOrigin(0.5);
    
    // Button hover effect
    acceptButton.on("pointerover", () => {
      acceptButton.fillColor = 0x00cc00;
    });
    
    acceptButton.on("pointerout", () => {
      acceptButton.fillColor = 0x00aa00;
    });
    
    // Button click action
    acceptButton.on("pointerdown", () => {
      acceptButton.fillColor = 0x009900;
    });
    
    acceptButton.on("pointerup", startNameEntry);
    
    // Add Enter key handler
    const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enterKey.on('down', startNameEntry);
  }
}
