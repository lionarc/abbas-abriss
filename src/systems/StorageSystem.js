import { TILE_SIZE, SIDEBAR_WIDTH } from "../scenes/GameScene.js";

export default class StorageSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Set up storage areas
    const gridX = SIDEBAR_WIDTH;
    const gridWidth = TILE_SIZE * 12; // GRID_WIDTH * TILE_SIZE
    const gridHeight = TILE_SIZE * 8; // GRID_HEIGHT * TILE_SIZE
    const gridY = 0;
    
    this.setupStorageAreas(gridX, gridY, gridWidth, gridHeight);
  }
  
  setupStorageAreas(gridX, gridY, gridWidth, gridHeight) {
    // Remove existing storage areas if they exist during resize
    if (this.holzlager) this.holzlager.destroy();
    if (this.fliesenlager) this.fliesenlager.destroy();
    if (this.muellplatz) this.muellplatz.destroy();
    
    const offsetY = 20; // Adjust this value to move the storage areas further down
    
    // Holzlager unten links
    this.holzlager = this.scene.add.image(gridX + 50, gridY + gridHeight - 50 + offsetY, "holzlager");
    this.scene.physics.add.existing(this.holzlager, true);

    // Fliesenlager unten rechts
    this.fliesenlager = this.scene.add.image(
      gridX + gridWidth - 50,
      gridY + gridHeight - 50 + offsetY,
      "tile_neu"
    );
    this.scene.physics.add.existing(this.fliesenlager, true);

    // Müllplatz in der Mitte
    const muellX = gridX + gridWidth / 2;
    const muellY = gridY + gridHeight - 50 + offsetY;
    this.muellplatz = this.scene.add.image(muellX, muellY, "trash2");
    this.scene.physics.add.existing(this.muellplatz, true);
    
    // Scale storage area images according to tile size
    const storageScale = TILE_SIZE / 64; // Assuming original assets sized for 64px tiles
    this.holzlager.setScale(storageScale);
    this.fliesenlager.setScale(storageScale);
    this.muellplatz.setScale(storageScale);
  }
  
  setupPlayerOverlaps(player) {
    // Holzlager overlap
    this.scene.physics.add.overlap(player.sprite, this.holzlager, () => {
      const woodAdded = player.inventorySystem.addWood();
      // Sound is now played inside the addWood method
    });

    // Fliesenlager overlap
    this.scene.physics.add.overlap(player.sprite, this.fliesenlager, () => {
      player.inventorySystem.addTiles(3);
    });

    // Muellplatz overlap
    this.scene.physics.add.overlap(player.sprite, this.muellplatz, () => {
      if (player.inventorySystem.clearInventory()) {
        this.scene.soundManager.playSound('trash');
      }
    });
  }
}
