import Phaser from "phaser";
import ControlsManager from "../managers/ControlsManager.js";
import InventorySystem from "../systems/InventorySystem.js";
import ActionSystem from "../systems/ActionSystem.js";
import VitalitySystem from "../systems/VitalitySystem.js";
import { TILE_SIZE } from "../scenes/GameScene.js";

export default class Player {
  constructor(scene, x, y, playerId = 0, spriteKey = "abbas") {
    this.scene = scene;
    this.playerId = playerId;
    
    // Create the sprite and physics
    this.createSprite(x, y, spriteKey);
    
    // Initialize systems
    this.controls = new ControlsManager(this);
    this.inventory = { holz: false, fliese: 0 };
    this.inventorySystem = new InventorySystem(this);
    this.actionSystem = new ActionSystem(this);
    this.vitalitySystem = new VitalitySystem(this);
    
    // Basic player properties
    this.speed = 400;
    this.tileSize = TILE_SIZE; // Use the constant from GameScene instead of hardcoding
    this.isMoving = false;
  }
  
  createSprite(x, y, spriteKey) {
    this.sprite = this.scene.add.sprite(x, y, spriteKey);
    
    // Different tint for the second player to distinguish
    if (this.playerId === 1) {
      this.sprite.setTint(0xff9999); // Reddish tint for player 2
    }
    
    if (this.sprite.height > 0) {
      // Store the desired scale as a property on the sprite itself for reference
      const baseScale = 74 / this.sprite.height;
      this.sprite.setScale(baseScale);
      this.sprite.baseScale = baseScale; // Store for reference
    }

    this.scene.physics.add.existing(this.sprite, false);
    this.sprite.body.setCollideWorldBounds(true);

    // Create UI labels
    this.createLabels(x, y);
  }
  
  createLabels(x, y) {
    this.label = this.scene.add.text(x, y - 30, "", {
      font: "16px Arial",
      fill: this.playerId === 0 ? "#0000ff" : "#ff0000", // Blue for P1, Red for P2
    }).setOrigin(0.5);

    this.fliesenCountLabel = this.scene.add.text(x + 15, y - 38, "", {
      font: "14px Arial",
      fill: "#fff",
      backgroundColor: this.playerId === 0 ? "#0000ff" : "#ff0000",
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
  }

  update(delta) {
    if (!this.sprite || !this.sprite.body) {
      console.error(`Player ${this.playerId + 1} sprite or body is undefined`);
      return;
    }
    
    // Reset velocity for this frame
    this.sprite.body.setVelocity(0);
    this.isMoving = false;

    // Handle movement input directly from controls manager
    this.controls.handleMovement();
    
    // Note: We no longer call handleActions() here since actions are handled via event listeners
    
    // Update vitality based on current movement state
    this.vitalitySystem.update(delta, this.isMoving);
    
    // Apply vitality-based movement penalties
    if (this.vitality < 30) {
      // Slow down player if vitality is low
      this.sprite.body.velocity.x *= 0.7;
      this.sprite.body.velocity.y *= 0.7;
    }

    // Update UI elements
    this.updateUIElements();
  }
  
  updateUIElements() {
    // Update label positions
    this.label.x = this.sprite.x;
    this.label.y = this.sprite.y - 30;
    this.fliesenCountLabel.x = this.sprite.x + 15;
    this.fliesenCountLabel.y = this.sprite.y - 38;

    // Update coffee icon if it exists
    if (this.vitalitySystem.coffeeIcon && this.vitalitySystem.coffeeIcon.visible) {
      this.vitalitySystem.coffeeIcon.x = this.sprite.x;
      this.vitalitySystem.coffeeIcon.y = this.sprite.y - 50;
    }

    // Update label text based on inventory
    let icon = "🔨";
    if (this.inventory.holz) icon = "🪵";
    else if (this.inventory.fliese > 0) icon = "🧱";
    this.label.setText(icon);

    // Update tiles count
    if (this.inventory.fliese > 0) {
      this.fliesenCountLabel.setText(this.inventory.fliese);
      this.fliesenCountLabel.setVisible(true);
    } else {
      this.fliesenCountLabel.setVisible(false);
    }
  }
  
  addVitality(amount) {
    this.vitalitySystem.addVitality(amount);
  }
  
  get vitality() {
    return this.vitalitySystem.vitality;
  }
}
