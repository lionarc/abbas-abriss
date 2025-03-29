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
      "Ein Wasserschaden wurde detektiert, sehr lange von der Verwaltung ignoriert, aber nun wurde Abbas Abriss beauftragt.",
      "",
      "Eure Aufgabe:",
      "• Zerschlagt die alten Fliesen mit der Hammer-Taste (Q/O)",
      "• Holt Holz vom Holzlager, um morsche Balken zu reparieren (E/U)",
      "• Holt neue Fliesen vom Fliesenlager und verlegt sie (E/U)",
      "• Achtet auf eure Energie, sammelt Kaffee für einen Boost",
      "",
      "Arbeitet als Team zusammen, um den Balkon zu sanieren!"
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
      "Auftrag annehmen",
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
    
    acceptButton.on("pointerup", () => {
      this.scene.start("NameEntryScene");
    });
  }
}
