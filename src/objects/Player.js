import Phaser from "phaser";

export default class Player {
  constructor(scene, x, y, playerId = 0, spriteKey = "abbas") {
    this.scene = scene;
    this.playerId = playerId;

    this.sprite = scene.add.sprite(x, y, spriteKey);
    
    // Different tint for the second player to distinguish
    if (playerId === 1) {
      this.sprite.setTint(0xff9999); // Reddish tint for player 2
    }
    
    if (this.sprite.height > 0) {
      const scale = 74 / this.sprite.height;
      this.sprite.setScale(scale);
    }

    scene.physics.add.existing(this.sprite, false);
    this.sprite.body.setCollideWorldBounds(true);

    this.label = scene.add.text(x, y - 30, "", {
      font: "16px Arial",
      fill: playerId === 0 ? "#0000ff" : "#ff0000", // Blue for P1, Red for P2
    }).setOrigin(0.5);

    this.fliesenCountLabel = scene.add.text(x + 15, y - 38, "", {
      font: "14px Arial",
      fill: "#fff",
      backgroundColor: playerId === 0 ? "#0000ff" : "#ff0000",
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    this.inventory = { holz: false, fliese: 0 };
    this.speed = 400;
    this.tileSize = 64;
    
    // Vitality system - starts at 100%
    this.vitality = 100;
    this.isMoving = false;
    this.vitalityDecayRate = 2; // How fast vitality depletes when moving (per second)
    this.vitalityRecoveryRate = 1; // How fast vitality recovers when standing still (per second)
    
    // Set up controls based on player ID
    this.setupControls(scene);
  }
  
  setupControls(scene) {
    if (this.playerId === 0) {
      // Player 1: WASD movement, Q for destroying tiles, E for repairs (wood & tiles)
      this.keys = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        action: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        repair: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    } else {
      // Player 2: IJKL movement, O for destroying tiles, U for repairs (wood & tiles)
      // Fixed: Ensure there's no conflict with O key
      this.keys = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        action: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O), 
        repair: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      };
    }
    
    // Add debug information
    console.log(`Player ${this.playerId + 1} controls initialized`);
  }

  update(delta) {
    if (!this.sprite || !this.sprite.body) {
      console.error(`Player ${this.playerId + 1} sprite or body is undefined`);
      return;
    }
    
    const body = this.sprite.body;
    body.setVelocity(0);
    this.isMoving = false;

    // Log key states for debugging (only once in a while)
    if (Math.random() < 0.01) {
      console.log(`Player ${this.playerId + 1} key states:`, {
        left: this.keys.left.isDown,
        right: this.keys.right.isDown,
        up: this.keys.up.isDown,
        down: this.keys.down.isDown
      });
    }

    // Movement controls - simplified for clarity
    if (this.keys.left.isDown) {
      body.setVelocityX(-this.speed);
      this.isMoving = true;
    }
    else if (this.keys.right.isDown) {
      body.setVelocityX(this.speed);
      this.isMoving = true;
    }
    
    if (this.keys.up.isDown) {
      body.setVelocityY(-this.speed);
      this.isMoving = true;
    }
    else if (this.keys.down.isDown) {
      body.setVelocityY(this.speed);
      this.isMoving = true;
    }

    // Update vitality based on movement
    this.updateVitality(delta);
    
    // Slow down player if vitality is low
    if (this.vitality < 30) {
      body.velocity.x *= 0.7;
      body.velocity.y *= 0.7;
    }

    // Action controls with vitality check
    if (Phaser.Input.Keyboard.JustDown(this.keys.action)) {
      if (this.vitality < 10) {
        console.log(`❌ Spieler ${this.playerId + 1}: Zu erschöpft zum Hämmern!`);
      } else if (!this.inventory.holz && this.inventory.fliese === 0) {
        this.checkTile();
        this.vitality -= 5; // Hammering costs vitality
      } else {
        console.log(`❌ Spieler ${this.playerId + 1}: Du kannst nur ohne Material Fliesen zerschlagen!`);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.repair)) {
      if (this.vitality < 10) {
        console.log(`❌ Spieler ${this.playerId + 1}: Zu erschöpft zum Reparieren!`);
      } else if (this.inventory.holz) {
        this.tryRepair(); // Try to repair with wood if carrying wood
        this.vitality -= 5; // Repairing costs vitality
      } else if (this.inventory.fliese > 0) {
        this.tryPlaceTile(); // Try to place tile if carrying tiles
        this.vitality -= 5; // Placing tile costs vitality
      } else {
        console.log(`❌ Spieler ${this.playerId + 1}: Du hast kein Material zum Reparieren!`);
      }
    }

    // Update UI elements
    this.label.x = this.sprite.x;
    this.label.y = this.sprite.y - 30;
    this.fliesenCountLabel.x = this.sprite.x + 15;
    this.fliesenCountLabel.y = this.sprite.y - 38;

    let icon = "🔨";
    if (this.inventory.holz) icon = "🪵";
    else if (this.inventory.fliese > 0) icon = "🧱";

    this.label.setText(icon);

    if (this.inventory.fliese > 0) {
      this.fliesenCountLabel.setText(this.inventory.fliese);
      this.fliesenCountLabel.setVisible(true);
    } else {
      this.fliesenCountLabel.setVisible(false);
    }
  }
  
  updateVitality(delta) {
    // Convert delta (ms) to seconds
    const deltaSeconds = delta / 1000;
    
    if (this.isMoving) {
      // Decrease vitality when moving
      this.vitality -= this.vitalityDecayRate * deltaSeconds;
    } else {
      // Recover vitality when standing still
      this.vitality += this.vitalityRecoveryRate * deltaSeconds;
    }
    
    // Ensure vitality stays within bounds
    this.vitality = Phaser.Math.Clamp(this.vitality, 0, 100);
  }
  
  addVitality(amount) {
    this.vitality = Math.min(this.vitality + amount, 100);
  }

  checkTile() {
    // Account for the sidebar offset when calculating grid position
    const offsetX = 200; // SIDEBAR_WIDTH
    const col = Math.floor((this.sprite.x - offsetX) / this.tileSize);
    const row = Math.floor(this.sprite.y / this.tileSize);
    
    console.log(`Player ${this.playerId + 1} attempting to hammer at [${col}, ${row}]`);
    
    const grid = this.scene.grid;
    if (!grid[row] || !grid[row][col]) {
      console.log(`❌ Spieler ${this.playerId + 1}: Außerhalb des Spielfelds`);
      return;
    }

    const tile = grid[row][col];
    const status = tile.data.get("status");
    let schläge = tile.data.get("schläge") || 0;

    console.log(`Tile status: ${status}, Schläge: ${schläge}`);

    if (status !== "aktiv") {
      console.log(`❌ Spieler ${this.playerId + 1}: Hier darf nicht gehämmert werden.`);
      return;
    }

    // Play hammering sound safely
    try {
      if (this.scene.sounds && this.scene.sounds.hammerTile) {
        this.scene.sounds.hammerTile.play();
      }
    } catch (error) {
      console.warn("Could not play hammer sound:", error);
    }

    schläge++;
    tile.data.set("schläge", schläge);
    console.log(`Hammered tile, new Schläge count: ${schläge}`);

    if (schläge === 1) tile.setTexture("tile_kaputt1");
    else if (schläge === 2) tile.setTexture("tile_kaputt2");
    else if (schläge === 3) tile.setTexture("tile_kaputt3");
    else if (schläge >= 4) {
      const istMorsch = Phaser.Math.Between(0, 1) === 0;
      tile.setTexture(istMorsch ? "tile_kaputt4_morsch" : "tile_kaputt4_intakt");
      tile.data.set("balken", istMorsch ? "morsch" : "intakt");
      tile.data.set("status", "fertig");
      
      // Play tile breaking sound safely
      try {
        if (this.scene.sounds && this.scene.sounds.tileBreak) {
          this.scene.sounds.tileBreak.play();
        }
      } catch (error) {
        console.warn("Could not play tile break sound:", error);
      }
      
      // Award points (2 points for breaking a tile)
      this.scene.addScore(this.playerId, 2);
      console.log(`+2 Punkte für Spieler ${this.playerId + 1} (Fliese komplett zerschlagen)`);
      
      this.scene.updateFertigStatus();
    }
  }

  tryRepair() {
    // Also fix grid coordinates for repair function
    const offsetX = 200; // SIDEBAR_WIDTH
    const col = Math.floor((this.sprite.x - offsetX) / this.tileSize);
    const row = Math.floor(this.sprite.y / this.tileSize);
    const grid = this.scene.grid;
    if (!grid[row] || !grid[row][col]) return;

    const tile = grid[row][col];
    const balkenStatus = tile.data.get("balken");
    const status = tile.data.get("status");

    if (status === "fertig" && balkenStatus === "morsch" && this.inventory.holz) {
      tile.data.set("balken", "intakt");
      tile.setTexture("tile_kaputt4_intakt");
      this.inventory.holz = false;
      
      // Play beam repair sound safely
      try {
        if (this.scene.sounds && this.scene.sounds.repairBeam) {
          this.scene.sounds.repairBeam.play();
        }
      } catch (error) {
        console.warn("Could not play repair beam sound:", error);
      }
      
      // Award points (6 points for repairing a beam)
      this.scene.addScore(this.playerId, 6);
      console.log(`+6 Punkte für Spieler ${this.playerId + 1} (Balken repariert)`);
      
      console.log(`🔧 Spieler ${this.playerId + 1}: Balken repariert bei [${col}, ${row}]`);
      this.scene.updateFertigStatus();
    }
  }

  tryPlaceTile() {
    // Also fix grid coordinates for place tile function
    const offsetX = 200; // SIDEBAR_WIDTH
    const col = Math.floor((this.sprite.x - offsetX) / this.tileSize);
    const row = Math.floor(this.sprite.y / this.tileSize);
    const grid = this.scene.grid;
    if (!grid[row] || !grid[row][col]) return;

    const tile = grid[row][col];
    const status = tile.data.get("status");
    const balkenStatus = tile.data.get("balken");

    if (status === "fertig" && balkenStatus === "intakt" && this.inventory.fliese > 0) {
      tile.setTexture("tile_neu");
      this.inventory.fliese--;
      tile.data.set("status", "final");
      
      // Play tile placing sound safely
      try {
        if (this.scene.sounds && this.scene.sounds.placeTile) {
          this.scene.sounds.placeTile.play();
        }
      } catch (error) {
        console.warn("Could not play place tile sound:", error);
      }
      
      // Award points (3 points for placing a new tile)
      this.scene.addScore(this.playerId, 3);
      console.log(`+3 Punkte für Spieler ${this.playerId + 1} (Neue Fliese verlegt)`);
      
      console.log(`🧱 Spieler ${this.playerId + 1}: Neue Fliese verlegt bei [${col}, ${row}]`);
      this.scene.updateFertigStatus();
    }
  }
}
