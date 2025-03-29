import Phaser from "phaser";

export default class ControlsManager {
  constructor(player) {
    this.player = player;
    this.scene = player.scene;
    
    // Set up controls based on player ID
    this.setupControls();
    
    // Add debug logging
    console.log(`Player ${this.player.playerId + 1} controls initialized:`, 
      this.player.playerId === 0 ? "WASD + Q/E" : "IJKL + O/U");
  }
  
  setupControls() {
    // Clear any existing keys first
    if (this.keys) {
      Object.values(this.keys).forEach(key => key.removeAllListeners());
    }

    if (this.player.playerId === 0) {
      // Player 1: WASD movement, Q for destroying tiles, E for repairs
      this.keys = {
        up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        action: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        repair: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    } else {
      // Player 2: IJKL movement, O for destroying tiles, U for repairs
      this.keys = {
        up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
        down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
        left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        action: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O), 
        repair: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      };
    }

    // Register action key event handlers directly
    this.keys.action.on('down', () => this.onActionKeyDown());
    this.keys.repair.on('down', () => this.onRepairKeyDown());
  }
  
  handleMovement() {
    // Get the player's sprite body
    const body = this.player.sprite.body;
    
    // Reset velocity and movement flag at the start of each frame
    body.setVelocity(0);
    this.player.isMoving = false;
    
    // Debug log for key states (uncommenting this might help debug)
    // console.log(`Player ${this.player.playerId + 1} keys:`, {
    //   left: this.keys.left.isDown, 
    //   right: this.keys.right.isDown,
    //   up: this.keys.up.isDown,
    //   down: this.keys.down.isDown
    // });
    
    // Apply velocity based on key states
    if (this.keys.left.isDown) {
      body.setVelocityX(-this.player.speed);
      this.player.isMoving = true;
    } 
    else if (this.keys.right.isDown) {
      body.setVelocityX(this.player.speed);
      this.player.isMoving = true;
    }
    
    if (this.keys.up.isDown) {
      body.setVelocityY(-this.player.speed);
      this.player.isMoving = true;
    } 
    else if (this.keys.down.isDown) {
      body.setVelocityY(this.player.speed);
      this.player.isMoving = true;
    }
    
    // Apply diagonal movement normalization if moving diagonally
    if ((this.keys.left.isDown || this.keys.right.isDown) && 
        (this.keys.up.isDown || this.keys.down.isDown)) {
      // Normalize diagonal movement
      const vector = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);
      vector.normalize().scale(this.player.speed);
      body.setVelocity(vector.x, vector.y);
    }
  }
  
  handleActions() {
    // We're now handling action keys via event listeners, 
    // so this method can be left empty or used for other action checks
  }
  
  onActionKeyDown() {
    console.log(`Action key pressed for Player ${this.player.playerId + 1} at position [${this.player.sprite.x}, ${this.player.sprite.y}]`);
    
    if (this.player.vitality < 10) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Zu erschöpft zum Hämmern!`);
    } else if (!this.player.inventory.holz && this.player.inventory.fliese === 0) {
      // Make sure to actually call the checkTile method
      try {
        this.player.actionSystem.checkTile();
      } catch (error) {
        console.error(`Error during tile check for Player ${this.player.playerId + 1}:`, error);
      }
      // Reduce vitality cost from 5 to just 2 for hammering
      this.player.vitalitySystem.vitality -= 2;
    } else {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Du kannst nur ohne Material Fliesen zerschlagen!`);
    }
  }

  onRepairKeyDown() {
    console.log(`Repair key pressed for Player ${this.player.playerId + 1}`);
    
    if (this.player.vitality < 10) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Zu erschöpft zum Reparieren!`);
    } else if (this.player.inventory.holz) {
      this.player.actionSystem.tryRepair();
      // Reduce the vitality cost of repairing to just 2 points (was 5)
      this.player.vitalitySystem.vitality -= 3;
    } else if (this.player.inventory.fliese > 0) {
      this.player.actionSystem.tryPlaceTile();
      // Reduce the vitality cost of placing a tile to just 2 points (was 5)
      this.player.vitalitySystem.vitality -= 3;
    } else {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Du hast kein Material zum Reparieren!`);
    }
  }
}
