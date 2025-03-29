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
    // Only Player 1 can collect wood
    if (this.player.playerId !== 0) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Nur Spieler 1 kann Holz sammeln!`);
      return false;
    }
    
    // Can't carry wood if already holding some
    if (this.inventory.holz >= 3) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: Du trägst bereits maximales Holz`);
      return false;
    }
    
    // Add wood to inventory (3 pieces at once)
    this.inventory.holz = 3;
    console.log(`🪵 Spieler ${this.player.playerId + 1}: Holz aufgenommen (3 Stück)`);
    
    // Play wood pickup sound
    this.scene.soundManager.playSound('takeWood');
    
    return true;
  }
  
  /**
   * Add tiles to the player's inventory
   * @returns {boolean} True if tiles were added, false if inventory is full
   */
  addTiles() {
    // Only Player 2 can collect tiles
    if (this.player.playerId !== 1) {
      console.log(`❌ Spieler ${this.player.playerId + 1}: Nur Spieler 2 kann Fliesen sammeln!`);
      return false;
    }
    
    // Inventory is already full
    if (this.inventory.fliese >= 4) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: Fliesen-Inventar ist bereits voll`);
      return false;
    }
    
    // Add tiles to inventory (4 at once)
    this.inventory.fliese = 4;
    console.log(`🧱 Spieler ${this.player.playerId + 1}: Flieseninventar aufgefüllt auf 4`);
    
    // Play tile pickup sound
    this.scene.soundManager.playSound('takeTile');
    
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
   * Use a single piece of wood from inventory
   * @returns {boolean} True if wood was used, false if no wood in inventory
   */
  useWood() {
    if (this.inventory.holz <= 0) {
      return false;
    }
    
    this.inventory.holz--;
    return true;
  }
  
  /**
   * Clear the entire inventory
   * @returns {number} Number of items that were cleared (for waste penalty)
   */
  clearInventory() {
    let itemsCleared = 0;
    
    if (this.inventory.holz) {
      itemsCleared += this.inventory.holz;
      this.inventory.holz = 0;
      console.log(`🪵 Spieler ${this.player.playerId + 1}: Holz in den Müll geworfen`);
    }
    
    if (this.inventory.fliese > 0) {
      itemsCleared += this.inventory.fliese;
      console.log(`🧱 Spieler ${this.player.playerId + 1}: ${this.inventory.fliese} Fliesen entsorgt`);
      this.inventory.fliese = 0;
    }
    
    if (itemsCleared > 0) {
      console.log(`📦 Spieler ${this.player.playerId + 1}: ${itemsCleared} Gegenstände entsorgt (+${itemsCleared}s Strafe)`);
    }
    
    return itemsCleared;
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
