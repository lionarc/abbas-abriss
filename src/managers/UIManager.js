import { SIDEBAR_WIDTH } from "../scenes/GameScene.js";

export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    
    // Create player UI
    this.setupPlayerUI();
  }

  createUIBackgrounds() {
    // Left sidebar for Player 1
    this.scene.add.rectangle(SIDEBAR_WIDTH / 2, this.scene.scale.height / 2, SIDEBAR_WIDTH, this.scene.scale.height, 0x0000cc, 0.2)
      .setOrigin(0.5, 0.5);
      
    // Right sidebar for Player 2
    this.scene.add.rectangle(this.scene.scale.width - SIDEBAR_WIDTH / 2, this.scene.scale.height / 2, SIDEBAR_WIDTH, this.scene.scale.height, 0xcc0000, 0.2)
      .setOrigin(0.5, 0.5);
  }
  
  setupPlayerUI() {
    // Status text in the main game area
    this.fertigText = this.scene.add.text(SIDEBAR_WIDTH + 10, 10, "", {
      font: "20px Arial",
      fill: "#000",
    });
    
    // Player 1 UI (left sidebar) - Wood specialist
    const p1X = 10;
    const p1Y = 60;
    let verticalSpacing = 70;
    
    this.player1UI = {
      title: this.scene.add.text(p1X, 20, this.scene.playerNames[0], { 
        font: "bold 24px Arial", 
        fill: "#0000ff",
        wordWrap: { width: SIDEBAR_WIDTH - 20 }
      }),
      role: this.scene.add.text(p1X, p1Y + 20, "Holz-Spezialist", {
        font: "16px Arial",
        fill: "#ffffff",
        fontStyle: "italic"
      }),
      score: this.scene.add.text(p1X, 60 + verticalSpacing, "Verschwendet: 0", { font: "18px Arial", fill: "#ffffff" }),
      controls: this.scene.add.text(p1X, 100 + verticalSpacing, "Steuerung:\nWASD - Bewegen\nQ - Zerstören\nE - Reparieren", 
        { font: "16px Arial", fill: "#ffffff", lineSpacing: 5 }),
      vitalityText: this.scene.add.text(p1X, p1Y, "Energie:", { font: "18px Arial", fill: "#ffffff" }),
      vitalityBar: this.scene.add.rectangle(p1X, p1Y + 30, 140, 20, 0x00ff00)
        .setOrigin(0, 0)
    };
    
    // Player 2 UI (right sidebar) - Tile specialist
    const p2X = this.scene.scale.width - SIDEBAR_WIDTH + 10;
    const p2Y = 60;
    
    this.player2UI = {
      title: this.scene.add.text(p2X, 20, this.scene.playerNames[1], { 
        font: "bold 24px Arial", 
        fill: "#ff0000",
        wordWrap: { width: SIDEBAR_WIDTH - 20 }
      }),
      role: this.scene.add.text(p2X, p2Y + 20, "Fliesen-Spezialist", {
        font: "16px Arial",
        fill: "#ffffff",
        fontStyle: "italic"
      }),
      score: this.scene.add.text(p2X, 60 + verticalSpacing, "Verschwendet: 0", { font: "18px Arial", fill: "#ffffff" }),
      controls: this.scene.add.text(p2X, 100 + verticalSpacing, "Steuerung:\nIJKL - Bewegen\nO - Zerstören\nU - Reparieren", 
        { font: "16px Arial", fill: "#ffffff", lineSpacing: 5 }),
      vitalityText: this.scene.add.text(p2X, p2Y, "Energie:", { font: "18px Arial", fill: "#ffffff" }),
      vitalityBar: this.scene.add.rectangle(p2X, p2Y + 30, 140, 20, 0x00ff00)
        .setOrigin(0, 0)
    };
  }
  
  updatePlayerUI() {
    // Update Player 1 UI
    this.player1UI.score.setText(`Verschwendet: ${this.scene.scores[0]}`);
    if (this.scene.players[0]) {
      const vitalityWidth = 140 * (this.scene.players[0].vitality / 100);
      this.player1UI.vitalityBar.width = vitalityWidth;
      
      // Change color based on vitality level
      if (this.scene.players[0].vitality > 60) {
        this.player1UI.vitalityBar.fillColor = 0x00ff00; // Green
      } else if (this.scene.players[0].vitality > 30) {
        this.player1UI.vitalityBar.fillColor = 0xffff00; // Yellow
      } else {
        this.player1UI.vitalityBar.fillColor = 0xff0000; // Red
      }
    }
    
    // Update Player 2 UI
    this.player2UI.score.setText(`Verschwendet: ${this.scene.scores[1]}`);
    if (this.scene.players[1]) {
      const vitalityWidth = 140 * (this.scene.players[1].vitality / 100);
      this.player2UI.vitalityBar.width = vitalityWidth;
      
      // Change color based on vitality level
      if (this.scene.players[1].vitality > 60) {
        this.player2UI.vitalityBar.fillColor = 0x00ff00; // Green
      } else if (this.scene.players[1].vitality > 30) {
        this.player2UI.vitalityBar.fillColor = 0xffff00; // Yellow
      } else {
        this.player2UI.vitalityBar.fillColor = 0xff0000; // Red
      }
    }
  }
}
