import Phaser from "phaser";
import { SIDEBAR_WIDTH, TILE_SIZE } from "../scenes/GameScene.js";

export default class ActionSystem {
  constructor(player) {
    this.player = player;
    this.scene = player.scene;
    this.tileSize = TILE_SIZE; // Use the constant from GameScene instead of player.tileSize
  }
  
  /**
   * Check and interact with the tile at the player's position
   */
  checkTile() {
    // Account for the sidebar offset when calculating grid position
    const offsetX = SIDEBAR_WIDTH; 
    
    // Fix the grid position calculation
    const worldX = this.player.sprite.x;
    const worldY = this.player.sprite.y;
    const gridX = worldX - offsetX; // Adjust X position by sidebar width
    
    // Calculate tile coordinates - ensure we're using integers
    const col = Math.floor(gridX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    
    // Debug output for position calculation
    console.log(`Player ${this.player.playerId + 1} position: [${worldX}, ${worldY}]`);
    console.log(`Adjusted grid coordinates: (${gridX}, ${worldY})`);
    console.log(`Calculated tile position: [${col}, ${row}]`);
    
    // Ensure valid grid bounds
    if (row < 0 || row >= this.scene.gridSystem.grid.length || 
        col < 0 || col >= this.scene.gridSystem.grid[0].length) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Außerhalb des Spielfelds (Bounds check)`);
      console.log(`Grid bounds: rows=${this.scene.gridSystem.grid.length}, cols=${this.scene.gridSystem.grid[0].length}`);
      return;
    }
    
    // Safely access the grid
    const grid = this.scene.gridSystem.grid;
    if (!grid[row] || !grid[row][col]) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Außerhalb des Spielfelds (Grid access)`);
      console.log(`Grid dimensions: ${grid.length} x ${grid[0]?.length}`);
      return;
    }

    const tile = grid[row][col];
    const status = tile.data.get("status");
    let schläge = tile.data.get("schläge") || 0;

    console.log(`Tile status: ${status}, Schläge: ${schläge}, Position: [${col}, ${row}]`);

    if (status !== "aktiv") {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Hier darf nicht gehämmert werden.`);
      return;
    }

    // Play hammering sound safely
    this.scene.soundManager.playSound('hammerTile');

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
      
      // Play tile breaking sound
      this.scene.soundManager.playSound('tileBreak');
      
      // Award points (2 points for breaking a tile)
      this.scene.trackContribution(this.player.playerId, 2);
      console.log(`+2 Punkte für Spieler ${this.player.playerId + 1} (Fliese komplett zerschlagen)`);
      
      this.scene.updateFertigStatus();
    }
  }

  /**
   * Try to repair the beam at the player's current position
   */
  tryRepair() {
    // Account for the sidebar offset when calculating grid position
    const offsetX = SIDEBAR_WIDTH; 
    
    // Fix the grid position calculation
    const worldX = this.player.sprite.x;
    const worldY = this.player.sprite.y;
    const gridX = worldX - offsetX; // Adjust X position by sidebar width
    
    // Calculate tile coordinates
    const col = Math.floor(gridX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    
    console.log(`Player ${this.player.playerId + 1} repair at tile [${col}, ${row}]`);
    
    // Ensure valid grid bounds
    if (row < 0 || row >= this.scene.gridSystem.grid.length || 
        col < 0 || col >= this.scene.gridSystem.grid[0].length) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Außerhalb des Spielfelds`);
      return;
    }
    
    const grid = this.scene.gridSystem.grid;
    if (!grid[row] || !grid[row][col]) return;

    const tile = grid[row][col];
    const balkenStatus = tile.data.get("balken");
    const status = tile.data.get("status");

    if (status === "fertig" && balkenStatus === "morsch" && this.player.inventory.holz > 0) {
      // Repair the beam
      tile.data.set("balken", "intakt");
      tile.setTexture("tile_kaputt4_intakt");
      
      // Use the wood from inventory
      this.player.inventorySystem.useWood();
      
      // Play repair sound
      this.scene.soundManager.playSound('repairBeam');
      
      // Award points (6 points for repairing a beam)
      this.scene.trackContribution(this.player.playerId, 6);
      console.log(`+6 Punkte für Spieler ${this.player.playerId + 1} (Balken repariert)`);
      
      console.log(`🔧 Spieler ${this.player.playerId + 1}: Balken repariert bei [${col}, ${row}]`);
      this.scene.updateFertigStatus();
    }
  }

  /**
   * Try to place a tile at the player's current position
   */
  tryPlaceTile() {
    // Account for the sidebar offset when calculating grid position
    const offsetX = SIDEBAR_WIDTH; 
    
    // Fix the grid position calculation
    const worldX = this.player.sprite.x;
    const worldY = this.player.sprite.y;
    const gridX = worldX - offsetX; // Adjust X position by sidebar width
    
    // Calculate tile coordinates
    const col = Math.floor(gridX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    
    console.log(`Player ${this.player.playerId + 1} place tile at [${col}, ${row}]`);
    
    // Ensure valid grid bounds
    if (row < 0 || row >= this.scene.gridSystem.grid.length || 
        col < 0 || col >= this.scene.gridSystem.grid[0].length) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Außerhalb des Spielfelds`);
      return;
    }
    
    const grid = this.scene.gridSystem.grid;
    if (!grid[row] || !grid[row][col]) return;

    const tile = grid[row][col];
    const status = tile.data.get("status");
    const balkenStatus = tile.data.get("balken");

    if (status === "fertig" && balkenStatus === "intakt" && this.player.inventory.fliese > 0) {
      // Place a new tile
      tile.setTexture("tile_neu");
      this.player.inventorySystem.removeTile();
      tile.data.set("status", "final");
      
      // Play tile placing sound
      this.scene.soundManager.playSound('placeTile');
      
      // Award points (3 points for placing a new tile)
      this.scene.trackContribution(this.player.playerId, 3);
      console.log(`+3 Punkte für Spieler ${this.player.playerId + 1} (Neue Fliese verlegt)`);
      
      console.log(`🧱 Spieler ${this.player.playerId + 1}: Neue Fliese verlegt bei [${col}, ${row}]`);
      this.scene.updateFertigStatus();
    }
  }
}
