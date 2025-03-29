import Phaser from "phaser";
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, VERROTTET_PROZENT } from "../scenes/GameScene.js";

export default class GridSystem {
  constructor(scene) {
    this.scene = scene;
    this.grid = [];
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
        const tileSprite = this.scene.add.image(x, y, "tile").setInteractive();
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
    
    return this.grid;
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
  
  // Additional grid utility methods could go here
}
