export default class InventorySystem {
  constructor(player) {
    this.player = player;
    this.scene = player.scene;
    
    // Reference to the player's inventory object
    this.inventory = player.inventory;
  }
  
  /**
   * Add wood to the player's inventory
   * @returns {boolean} True if wood was added, false if inventory is full
   */
  addWood() {
    // Can't carry wood if player has tiles
    if (this.inventory.fliese > 0) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Du trägst Fliesen – kein Platz für Holz`);
      return false;
    }
    
    // Player already has wood
    if (this.inventory.holz) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: Du hast bereits Holz`);
      return false;
    }
    
    // Add wood to inventory
    this.inventory.holz = true;
    console.log(`🪵 Spieler ${this.player.playerId + 1}: Holz aufgenommen`);
    
    // Play wood pickup sound
    this.scene.soundManager.playSound('takeWood');
    
    return true;
  }
  
  /**
   * Add tiles to the player's inventory
   * @param {number} amount Number of tiles to add
   * @returns {boolean} True if tiles were added, false if inventory is full or player has wood
   */
  addTiles(amount = 3) {
    // Can't carry tiles if player has wood
    if (this.inventory.holz) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Du trägst Holz – keine Fliesenaufnahme möglich.`);
      return false;
    }
    
    // Inventory is already full
    if (this.inventory.fliese >= 3) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: Fliesen-Inventar ist bereits voll`);
      return false;
    }
    
    // Add tiles to inventory
    this.inventory.fliese = amount;
    console.log(`🧱 Spieler ${this.player.playerId + 1}: Flieseninventar aufgefüllt auf ${amount}`);
    return true;
  }
  
  /**
   * Remove a single tile from inventory
   * @returns {boolean} True if a tile was removed, false if no tiles in inventory
   */
  removeTile() {
    if (this.inventory.fliese <= 0) {
      return false;
    }
    
    this.inventory.fliese--;
    return true;
  }
  
  /**
   * Use wood from inventory
   * @returns {boolean} True if wood was used, false if no wood in inventory
   */
  useWood() {
    if (!this.inventory.holz) {
      return false;
    }
    
    this.inventory.holz = false;
    return true;
  }
  
  /**
   * Clear the entire inventory
   * @returns {boolean} True if anything was cleared
   */
  clearInventory() {
    let changed = false;
    
    if (this.inventory.holz) {
      this.inventory.holz = false;
      console.log(`🪵 Spieler ${this.player.playerId + 1}: Holz in den Müll geworfen`);
      changed = true;
    }
    
    if (this.inventory.fliese > 0) {
      console.log(`🧱 Spieler ${this.player.playerId + 1}: ${this.inventory.fliese} Fliesen entsorgt`);
      this.inventory.fliese = 0;
      changed = true;
    }
    
    if (changed) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: Inventar geleert`);
    }
    
    return changed;
  }
  
  /**
   * Check if player has any items in inventory
   * @returns {boolean} True if inventory has any items
   */
  hasItems() {
    return this.inventory.holz || this.inventory.fliese > 0;
  }
  
  /**
   * Get inventory status for display
   * @returns {string} Emoji representing current inventory
   */
  getInventoryIcon() {
    if (this.inventory.holz) return "🪵";
    if (this.inventory.fliese > 0) return "🧱";
    return "🔨";
  }
}
