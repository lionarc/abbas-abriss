import Phaser from "phaser";
import Player from "../objects/Player.js";
import UIManager from "../managers/UIManager.js";
import GridSystem from "../systems/GridSystem.js";
import StorageSystem from "../systems/StorageSystem.js";
import SoundManager from "../managers/SoundManager.js";

// Game constants
export const TILE_SIZE = 64;
export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 8;
export const VERROTTET_PROZENT = 0.3; // 30%
export const SIDEBAR_WIDTH = 200; // Width of each sidebar

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.scores = [0, 0]; // Repurposed for tracking penalties
    this.successSoundPlayed = false; 
    this.playerNames = ["Spieler 1", "Spieler 2"];
    this.startTime = 0; // Track when the game starts
    this.completionTime = 0; // Track how long it took to complete
    this.timerActive = false; // Whether the timer is currently running
    this.wasteCount = 0; // Count items thrown away as penalties
  }
  
  init(data) {
    // Get player names from previous scene if available
    if (data && data.playerNames) {
      this.playerNames = data.playerNames;
    }
  }

  preload() {
    // Load images
    this.load.image("tile", "/assets/tile_gut.png");
    this.load.image("tile_kaputt", "/assets/tile_kaputt.png");
    this.load.image("tile_neu", "/assets/tile_neu.png");
    this.load.image("holzlager", "/assets/holzlager.png");
    this.load.image("abbas", "/assets/abbas.png");
    this.load.image("trash2", "/assets/trash2.png");
    this.load.image("tile_kaputt1", "/assets/tile_kaputt1.png");
    this.load.image("tile_kaputt2", "/assets/tile_kaputt2.png");
    this.load.image("tile_kaputt3", "/assets/tile_kaputt3.png");
    this.load.image("tile_start", "/assets/tile_start.png");
    this.load.image("tile_kaputt4_intakt", "/assets/tile_kaputt4_intakt.png");
    this.load.image("tile_kaputt4_morsch", "/assets/tile_kaputt4_morsch.png");
    this.load.image("abbas2", "/assets/abbas.png");
    this.load.image("coffee", "/assets/coffee.png");
    
    // Load sound effects
    this.load.audio('hammer_tile', '/assets/sounds/tile_click.mp3');
    this.load.audio('tile_break', '/assets/sounds/plate_crash.mp3');
    this.load.audio('repair_beam', '/assets/sounds/hammer_nail.mp3');
    this.load.audio('place_tile', '/assets/sounds/plop.mp3');
    this.load.audio('success', '/assets/sounds/success.mp3');
    this.load.audio('trash', '/assets/sounds/trash.mp3');
    this.load.audio('drink', '/assets/sounds/drink.mp3');
    this.load.audio('take_wood', '/assets/sounds/take_wood.mp3');
    this.load.audio('take_tile', '/assets/sounds/take_tile.mp3');
  }

  create() {
    // Initialize managers and systems first
    this.uiManager = new UIManager(this);
    this.gridSystem = new GridSystem(this);
    this.soundManager = new SoundManager(this);
    this.storageSystem = new StorageSystem(this); // Initialize storage system first
    
    // Now set up game components after managers are initialized
    this.setupGameWorld();
    
    // Create grid
    this.gridSystem.createGrid(SIDEBAR_WIDTH);
    console.log("Grid dimensions:", {
      rows: this.gridSystem.grid.length,
      cols: this.gridSystem.grid[0]?.length || 0
    });
    
    // Start broken tile spawning
    this.startTileSpawner();
    
    // Create players
    this.createPlayers();
    
    // Initial UI update
    this.updateFertigStatus();
    this.uiManager.updatePlayerUI();
    
    // Initialize coffee system
    this.coffeeAvailable = false;
    this.coffeeSprite = null;
    this.startCoffeeSystem();
    
    // Start the game timer
    this.startGameTimer();
  }

  setupGameWorld() {
    // Create UI backgrounds
    this.uiManager.createUIBackgrounds();
    
    // Adjust world bounds
    const gridWidth = GRID_WIDTH * TILE_SIZE;
    const gridHeight = GRID_HEIGHT * TILE_SIZE;
    const gridX = SIDEBAR_WIDTH;
    const gridY = 0;
    
    this.physics.world.setBounds(gridX, gridY, gridWidth, gridHeight);
  }

  createPlayers() {
    const gridX = SIDEBAR_WIDTH;
    const gridY = 0;
    
    // Create two players at different starting positions
    const startX1 = gridX + TILE_SIZE + TILE_SIZE / 2;
    const startY1 = gridY + TILE_SIZE + TILE_SIZE / 2;
    const startX2 = gridX + TILE_SIZE * 10 + TILE_SIZE / 2;
    const startY2 = gridY + TILE_SIZE + TILE_SIZE / 2;
    
    // Create players
    this.players = [
      new Player(this, startX1, startY1, 0, "abbas"),
      new Player(this, startX2, startY2, 1, "abbas2")
    ];
    
    console.log("Players created:", this.players.length);
    
    // Add overlaps for both players
    this.players.forEach(player => {
      this.storageSystem.setupPlayerOverlaps(player);
    });
  }

  startTileSpawner() {
    // Timer for spawning broken tiles
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 7000),
      callback: () => {
        this.gridSystem.spawnKaputteFliese();
        // Reset timer with new random delay
        this.time.addEvent({
          delay: Phaser.Math.Between(2000, 7000),
          callback: () => this.gridSystem.spawnKaputteFliese(),
          loop: true,
        });
      },
      loop: false,
    });
  }

  startCoffeeSystem() {
    // Create coffee sprite (initially hidden)
    this.coffeeSprite = this.add.image(0, 0, "coffee");
    
    // Set a fixed scale for the coffee sprite based on the tile size
    const coffeeScale = TILE_SIZE / 128; // Adjust if your coffee image has a different size
    this.coffeeSprite.setScale(coffeeScale);
    
    this.coffeeSprite.setVisible(false);
    this.physics.add.existing(this.coffeeSprite, false);
    this.coffeeSprite.body.setSize(TILE_SIZE, TILE_SIZE);
    
    // Add player overlaps with coffee
    this.players.forEach(player => {
      this.physics.add.overlap(player.sprite, this.coffeeSprite, () => {
        if (this.coffeeAvailable) {
          this.collectCoffee(player);
        }
      });
    });
    
    // Schedule first coffee spawn
    this.time.delayedCall(
      Phaser.Math.Between(5000, 15000), // 5-15 seconds delay
      this.spawnCoffee,
      [],
      this
    );
  }
  
  spawnCoffee() {
    if (!this.coffeeAvailable) {
      // Get all tiles that aren't empty or in a transition state
      const validTiles = this.gridSystem.grid.flat().filter(tile => {
        const status = tile.data.get("status");
        return status === "fertig" || status === "final" || status === "leer" || status === "aktiv";
      });
      
      if (validTiles.length > 0) {
        // Choose a random tile
        const randomTile = Phaser.Utils.Array.GetRandom(validTiles);
        
        // Position coffee on this tile
        this.coffeeSprite.x = randomTile.x;
        this.coffeeSprite.y = randomTile.y;
        this.coffeeSprite.setVisible(true);
        this.coffeeSprite.body.enable = true;
        this.coffeeAvailable = true;
        
        console.log("☕ Coffee spawned at", randomTile.x, randomTile.y);
        
        // Add a little animation to make it noticeable without changing the scale permanently
        this.tweens.add({
          targets: this.coffeeSprite,
          alpha: { from: 0.6, to: 1 },
          duration: 300,
          ease: 'Bounce',
          yoyo: true,
          repeat: 2
        });
      }
    }
  }
  
  collectCoffee(player) {
    if (this.coffeeAvailable) {
      console.log(`Player ${player.playerId + 1} collected coffee!`);
      
      // Play coffee drink sound
      this.soundManager.playSound('drink');
      
      // Hide coffee
      this.coffeeSprite.setVisible(false);
      this.coffeeSprite.body.enable = false;
      this.coffeeAvailable = false;
      
      // Apply coffee effect to player
      player.vitalitySystem.applyCoffeeEffect();
      
      // Visual feedback
      const coffeeEffect = this.add.text(
        this.coffeeSprite.x, 
        this.coffeeSprite.y, 
        "☕", 
        { font: "32px Arial", stroke: "#000", strokeThickness: 3 }
      ).setOrigin(0.5);
      
      // Keep the coffee emoji at a consistent size
      coffeeEffect.setScale(1);
      
      this.tweens.add({
        targets: coffeeEffect,
        y: coffeeEffect.y - 50,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        onComplete: () => coffeeEffect.destroy()
      });
      
      // Schedule next coffee spawn
      this.time.delayedCall(
        Phaser.Math.Between(20000, 40000), // 20-40 seconds delay
        this.spawnCoffee,
        [],
        this
      );
    }
  }

  startGameTimer() {
    this.startTime = this.time.now;
    this.timerActive = true;
    
    // Create timer text
    this.timerText = this.add.text(
      SIDEBAR_WIDTH + 10, 
      40, 
      "Zeit: 00:00", 
      {
        font: "20px Arial",
        fill: "#000",
      }
    );
    
    // Update timer every second
    this.time.addEvent({
      delay: 100, // Update more frequently for accuracy
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }
  
  updateTimer() {
    if (!this.timerActive) return;
    
    const elapsed = this.time.now - this.startTime;
    this.completionTime = elapsed;
    
    // Format time as mm:ss.ms
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    
    this.timerText.setText(`Zeit: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`);
  }
  
  stopTimer() {
    this.timerActive = false;
    
    // Add waste penalty to completion time (1 second per wasted item)
    this.completionTime += (this.wasteCount * 1000);
    
    // Format final time
    const elapsed = this.completionTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  update(time, delta) {
    // Update players
    if (this.players && this.players.length === 2) {
      this.players.forEach((player, index) => {
        if (player) {
          player.update(delta);
        } else {
          console.error(`Player ${index + 1} is undefined`);
        }
      });
      
      // Update UI
      this.uiManager.updatePlayerUI();
    } else {
      console.error("Players array is invalid:", this.players);
    }
  }

  addWastePenalty(playerIndex, items) {
    // Each wasted item adds penalty seconds
    this.scores[playerIndex] += items;
    this.wasteCount += items;
    
    // Still give vitality boost to player for gameplay purposes
    if (this.players[playerIndex]) {
      this.players[playerIndex].addVitality(items * 2);
    }
    
    // Update UI to show the new penalty count
    this.uiManager.updatePlayerUI();
  }

  updateFertigStatus() {
    const total = GRID_WIDTH * 7; // nur Spielfläche (ohne Lagerreihe)
    const fertig = this.gridSystem.grid
      .flat()
      .filter((tile) => tile.data.get("status") === "fertig" || tile.data.get("status") === "final").length;
    this.uiManager.fertigText.setText(`Fertige Felder: ${fertig} / ${total}`);
    
    // Check if all tiles are repaired
    const finalTiles = this.gridSystem.grid.flat().filter(tile => tile.data.get("status") === "final").length;
    if (finalTiles === total && !this.successSoundPlayed) {
      this.soundManager.playSound('success');
      this.successSoundPlayed = true;
      console.log("🎉 Alle Fliesen wurden erfolgreich repariert!");
      
      // Stop the timer when complete
      const finalTime = this.stopTimer();
      console.log(`Team completed in: ${finalTime}`);
      
      this.displayVictoryMessage(finalTime);
      
      // Full vitality boost for all players when the game is won
      this.players.forEach(player => player.addVitality(100));
    }
  }

  displayVictoryMessage(finalTime) {
    // Display a victory message
    const victoryText = this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2 - 60, 
      "ALLE FLIESEN REPARIERT!", 
      { 
        font: "bold 32px Arial", 
        fill: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 } 
      }
    ).setOrigin(0.5);
    
    // Display the waste penalty
    const penaltyText = this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2, 
      `Verschwendete Materialien: ${this.wasteCount} (+${this.wasteCount}s)`, 
      { 
        font: "20px Arial", 
        fill: "#ff9900",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 } 
      }
    ).setOrigin(0.5);
    
    // Display the completion time
    const timeText = this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2 + 50, 
      `Team Zeit: ${finalTime}`, 
      { 
        font: "bold 28px Arial", 
        fill: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 } 
      }
    ).setOrigin(0.5);
    
    // Make them blink
    this.tweens.add({
      targets: [victoryText, penaltyText, timeText],
      alpha: { from: 1, to: 0 },
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: 5
    });
    
    // Add a delay before transitioning to end screen
    this.time.delayedCall(3000, () => {
      // Transition to end game scene with waste count, time and player names
      this.scene.start("EndGameScene", {
        scores: this.scores,
        playerNames: this.playerNames,
        completionTime: this.completionTime,
        wasteCount: this.wasteCount
      });
    });
  }
}
