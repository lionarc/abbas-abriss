import Phaser from "phaser";
import Player from "../objects/Player.js";

const TILE_SIZE = 64;
const GRID_WIDTH = 12;
const GRID_HEIGHT = 8;
const VERROTTET_PROZENT = 0.3; // 30 %
const SIDEBAR_WIDTH = 200; // Width of each sidebar

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.scores = [0, 0]; // Player 1 and Player 2 scores
    this.successSoundPlayed = false; // Track if we've played the success sound
  }

  preload() {
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
    this.load.image("abbas2", "/assets/abbas.png"); // Second player sprite (you might want a different asset)
    
    // Load sound effects
    this.load.audio('hammer_tile', '/assets/sounds/tile_click.mp3');
    this.load.audio('tile_break', '/assets/sounds/plate_crash.mp3');
    this.load.audio('repair_beam', '/assets/sounds/hammer_nail.mp3');
    this.load.audio('place_tile', '/assets/sounds/plop.mp3');
    this.load.audio('success', '/assets/sounds/success.mp3');
  }

  create() {
    // Create UI panels for player information
    this.createUIBackgrounds();
    
    // Adjust world bounds to center the grid
    const gridWidth = GRID_WIDTH * TILE_SIZE;
    const gridHeight = GRID_HEIGHT * TILE_SIZE;
    const gridX = SIDEBAR_WIDTH;
    const gridY = 0;
    
    this.physics.world.setBounds(
      gridX,
      gridY,
      gridWidth,
      gridHeight
    );
    
    // Create grid with offset
    this.createGrid(gridX);

    // Timer for spawning broken tiles
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 7000),
      callback: () => {
        this.spawnKaputteFliese();
        // Reset timer with new random delay
        this.time.addEvent({
          delay: Phaser.Math.Between(2000, 7000),
          callback: () => this.spawnKaputteFliese(),
          loop: true,
        });
      },
      loop: false,
    });

    // Create two players at different starting positions
    const startX1 = gridX + TILE_SIZE + TILE_SIZE / 2;
    const startY1 = gridY + TILE_SIZE + TILE_SIZE / 2;
    const startX2 = gridX + TILE_SIZE * 10 + TILE_SIZE / 2;
    const startY2 = gridY + TILE_SIZE + TILE_SIZE / 2;
    
    // Create players and ensure they're properly initialized
    this.players = [
      new Player(this, startX1, startY1, 0, "abbas"),
      new Player(this, startX2, startY2, 1, "abbas2")
    ];
    
    console.log("Players created:", this.players.length);

    // Holzlager unten links
    this.holzlager = this.add.image(gridX + 50, gridY + gridHeight - 50, "holzlager");
    this.physics.add.existing(this.holzlager, true);

    // Fliesenlager unten rechts
    this.fliesenlager = this.add.image(
      gridX + gridWidth - 50,
      gridY + gridHeight - 50,
      "tile_neu"
    );
    this.physics.add.existing(this.fliesenlager, true);

    // Müllplatz in der Mitte
    const muellX = gridX + gridWidth / 2;
    const muellY = gridY + gridHeight - 50;
    this.muellplatz = this.add.image(muellX, muellY, "trash2");
    this.physics.add.existing(this.muellplatz, true);

    // Add overlaps for both players
    this.players.forEach(player => {
      this.setupPlayerOverlaps(player);
    });

    // Set up player info UI
    this.setupPlayerUI();
    
    // Create sound effects with error handling
    this.setupSounds();
    
    // Initial update of UI elements
    this.updateFertigStatus();
    this.updatePlayerUI();
  }
  
  createUIBackgrounds() {
    // Left sidebar for Player 1
    this.add.rectangle(SIDEBAR_WIDTH / 2, this.scale.height / 2, SIDEBAR_WIDTH, this.scale.height, 0x0000cc, 0.2)
      .setOrigin(0.5, 0.5);
      
    // Right sidebar for Player 2
    this.add.rectangle(this.scale.width - SIDEBAR_WIDTH / 2, this.scale.height / 2, SIDEBAR_WIDTH, this.scale.height, 0xcc0000, 0.2)
      .setOrigin(0.5, 0.5);
  }
  
  setupPlayerUI() {
    // Status text in the main game area
    this.fertigText = this.add.text(SIDEBAR_WIDTH + 10, 10, "", {
      font: "20px Arial",
      fill: "#000",
    });
    
    // Player 1 UI (left sidebar)
    const p1X = 10;
    this.player1UI = {
      title: this.add.text(p1X, 20, "Spieler 1", { font: "bold 24px Arial", fill: "#0000ff" }),
      score: this.add.text(p1X, 60, "Punkte: 0", { font: "18px Arial", fill: "#ffffff" }),
      controls: this.add.text(p1X, 100, "Steuerung:\nWASD - Bewegen\nQ - Zerstören\nE - Reparieren", 
        { font: "16px Arial", fill: "#ffffff", lineSpacing: 5 }),
      vitalityText: this.add.text(p1X, 200, "Energie:", { font: "18px Arial", fill: "#ffffff" }),
      vitalityBar: this.add.rectangle(p1X + 50, 230, 140, 20, 0x00ff00)
        .setOrigin(0, 0.5)
    };
    
    // Player 2 UI (right sidebar)
    const p2X = this.scale.width - SIDEBAR_WIDTH + 10;
    this.player2UI = {
      title: this.add.text(p2X, 20, "Spieler 2", { font: "bold 24px Arial", fill: "#ff0000" }),
      score: this.add.text(p2X, 60, "Punkte: 0", { font: "18px Arial", fill: "#ffffff" }),
      controls: this.add.text(p2X, 100, "Steuerung:\nIJKL - Bewegen\nO - Zerstören\nU - Reparieren", 
        { font: "16px Arial", fill: "#ffffff", lineSpacing: 5 }),
      vitalityText: this.add.text(p2X, 200, "Energie:", { font: "18px Arial", fill: "#ffffff" }),
      vitalityBar: this.add.rectangle(p2X + 50, 230, 140, 20, 0x00ff00)
        .setOrigin(0, 0.5)
    };
  }
  
  setupSounds() {
    this.sounds = {};
    try {
      this.sounds = {
        hammerTile: this.sound.add('hammer_tile'),
        tileBreak: this.sound.add('tile_break'),
        repairBeam: this.sound.add('repair_beam'),
        placeTile: this.sound.add('place_tile'),
        success: this.sound.add('success')
      };
      console.log("Sound effects loaded successfully");
    } catch (error) {
      console.warn("Could not load sound effects:", error);
      // Create empty sound object with play method that does nothing
      this.sounds = {
        hammerTile: { play: () => {} },
        tileBreak: { play: () => {} },
        repairBeam: { play: () => {} },
        placeTile: { play: () => {} },
        success: { play: () => {} }
      };
    }
  }

  setupPlayerOverlaps(player) {
    // Holzlager overlap
    this.physics.add.overlap(player.sprite, this.holzlager, () => {
      const inv = player.inventory;
      if (inv.fliese > 0) {
        console.log(`❌ Spieler ${player.playerId + 1}: Du trägst Fliesen – kein Platz für Holz`);
        return;
      }

      if (!inv.holz) {
        inv.holz = true;
        console.log(`🪵 Spieler ${player.playerId + 1}: Holz aufgenommen`);
      } else {
        console.log(`📦 Spieler ${player.playerId + 1}: Du hast bereits Holz`);
      }
    });

    // Fliesenlager overlap
    this.physics.add.overlap(player.sprite, this.fliesenlager, () => {
      const inv = player.inventory;
      if (inv.holz) {
        console.log(`❌ Spieler ${player.playerId + 1}: Du trägst Holz – keine Fliesenaufnahme möglich.`);
        return;
      }

      if (inv.fliese < 3) {
        inv.fliese = 3;
        console.log(`🧱 Spieler ${player.playerId + 1}: Flieseninventar aufgefüllt auf 3`);
      } else {
        console.log(`📦 Spieler ${player.playerId + 1}: Fliesen-Inventar ist bereits voll`);
      }
    });

    // Muellplatz overlap
    this.physics.add.overlap(player.sprite, this.muellplatz, () => {
      const inv = player.inventory;
      let changed = false;

      if (inv.holz) {
        inv.holz = false;
        console.log(`🪵 Spieler ${player.playerId + 1}: Holz in den Müll geworfen`);
        changed = true;
      }

      if (inv.fliese > 0) {
        console.log(`🧱 Spieler ${player.playerId + 1}: ${inv.fliese} Fliesen entsorgt`);
        inv.fliese = 0;
        changed = true;
      }

      if (changed) {
        console.log(`📦 Spieler ${player.playerId + 1}: Inventar geleert`);
      }
    });
  }

  update(time, delta) {
    // Make sure we're updating both players
    if (this.players && this.players.length === 2) {
      this.players.forEach((player, index) => {
        if (player) {
          player.update(delta);  // Pass delta for time-based stamina reduction
        } else {
          console.error(`Player ${index + 1} is undefined`);
        }
      });
      
      // Update UI with latest player info
      this.updatePlayerUI();
    } else {
      console.error("Players array is invalid:", this.players);
    }
  }
  
  updatePlayerUI() {
    // Update Player 1 UI
    this.player1UI.score.setText(`Punkte: ${this.scores[0]}`);
    if (this.players[0]) {
      const vitalityWidth = 140 * (this.players[0].vitality / 100);
      this.player1UI.vitalityBar.width = vitalityWidth;
      
      // Change color based on vitality level
      if (this.players[0].vitality > 60) {
        this.player1UI.vitalityBar.fillColor = 0x00ff00; // Green
      } else if (this.players[0].vitality > 30) {
        this.player1UI.vitalityBar.fillColor = 0xffff00; // Yellow
      } else {
        this.player1UI.vitalityBar.fillColor = 0xff0000; // Red
      }
    }
    
    // Update Player 2 UI
    this.player2UI.score.setText(`Punkte: ${this.scores[1]}`);
    if (this.players[1]) {
      const vitalityWidth = 140 * (this.players[1].vitality / 100);
      this.player2UI.vitalityBar.width = vitalityWidth;
      
      // Change color based on vitality level
      if (this.players[1].vitality > 60) {
        this.player2UI.vitalityBar.fillColor = 0x00ff00; // Green
      } else if (this.players[1].vitality > 30) {
        this.player2UI.vitalityBar.fillColor = 0xffff00; // Yellow
      } else {
        this.player2UI.vitalityBar.fillColor = 0xff0000; // Red
      }
    }
  }

  addScore(playerIndex, points) {
    this.scores[playerIndex] += points;
    // Vitality boost when scoring points
    if (this.players[playerIndex]) {
      this.players[playerIndex].addVitality(points * 5); // Add vitality proportional to points
    }
  }

  updateFertigStatus() {
    const total = 12 * 7; // nur Spielfläche (ohne Lagerreihe)
    const fertig = this.grid
      .flat()
      .filter((tile) => tile.data.get("status") === "fertig" || tile.data.get("status") === "final").length;
    this.fertigText.setText(`Fertige Felder: ${fertig} / ${total}`);
    
    // Check if all tiles are repaired and play success sound
    const finalTiles = this.grid.flat().filter(tile => tile.data.get("status") === "final").length;
    if (finalTiles === total && !this.successSoundPlayed) {
      try {
        this.sounds.success.play();
      } catch (error) {
        console.warn("Could not play success sound:", error);
      }
      this.successSoundPlayed = true;
      console.log("🎉 Alle Fliesen wurden erfolgreich repariert!");
      
      // Display a victory message
      const victoryText = this.add.text(
        this.scale.width / 2, 
        this.scale.height / 2, 
        "ALLE FLIESEN REPARIERT!", 
        { 
          font: "bold 32px Arial", 
          fill: "#00ff00",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 } 
        }
      ).setOrigin(0.5);
      
      // Make it blink
      this.tweens.add({
        targets: victoryText,
        alpha: { from: 1, to: 0 },
        duration: 500,
        ease: 'Power2',
        yoyo: true,
        repeat: 5
      });
      
      // Full vitality boost for all players when the game is won
      this.players.forEach(player => player.addVitality(100));
    }
  }

  spawnKaputteFliese() {
    // Alle Felder sammeln, die leer sind
    const leereFelder = this.grid
      .flat()
      .filter((t) => t.data.get("status") === "leer");
    if (leereFelder.length === 0) return;

    const ziel = Phaser.Utils.Array.GetRandom(leereFelder);
    ziel.setTexture("tile_start");
    ziel.data.set("status", "aktiv");
    ziel.data.set("schläge", 0);
  }

  createGrid(offsetX = 0) {
    this.grid = [];

    const totalTiles = GRID_WIDTH * GRID_HEIGHT;
    const totalVerrottet = Math.floor(totalTiles * VERROTTET_PROZENT);

    // Eine Liste mit allen Indexpositionen, zufällig verrottet markieren
    const allPositions = Phaser.Utils.Array.NumberArray(0, totalTiles - 1);
    Phaser.Utils.Array.Shuffle(allPositions);
    const verrotteteIndices = new Set(allPositions.slice(0, totalVerrottet));

    for (let row = 0; row < GRID_HEIGHT - 1; row++) {
      this.grid[row] = [];
      for (let col = 0; col < GRID_WIDTH; col++) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        // Fliese zeichnen
        const tileSprite = this.add.image(x, y, "tile").setInteractive();
        tileSprite.setDataEnabled();

        // Logikdaten setzen
        const index = row * GRID_WIDTH + col;
        const balkenZustand = verrotteteIndices.has(index)
          ? "verrottet"
          : "intakt";

        tileSprite.data.set({
          row,
          col,
          status: "leer", // oder später: 'aktiv', 'fertig'
          schläge: 0,
          balken: null, // wird später zu 'morsch' oder 'intakt'
        });

        this.grid[row][col] = tileSprite;
      }
    }

    // Debug-Ausgabe
    console.log("Raster aufgebaut mit verrotteten Balken:");
    this.grid.flat().forEach((tile) => {
      const { row, col } = tile.data.values;
      if (tile.data.get("balken") === "verrottet") {
        console.log(`→ Verrottet bei [${col}, ${row}]`);
      }
    });
  }
}
