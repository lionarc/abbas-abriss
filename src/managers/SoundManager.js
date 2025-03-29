export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.setupSounds();
  }
  
  setupSounds() {
    this.sounds = {};
    try {
      this.sounds = {
        hammerTile: this.scene.sound.add('hammer_tile'),
        tileBreak: this.scene.sound.add('tile_break'),
        repairBeam: this.scene.sound.add('repair_beam'),
        placeTile: this.scene.sound.add('place_tile'),
        success: this.scene.sound.add('success'),
        trash: this.scene.sound.add('trash'),
        drink: this.scene.sound.add('drink'),
        takeWood: this.scene.sound.add('take_wood'),
        takeTile: this.scene.sound.add('take_tile')
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
        success: { play: () => {} },
        trash: { play: () => {} },
        drink: { play: () => {} },
        takeWood: { play: () => {} },
        takeTile: { play: () => {} }
      };
    }
  }
  
  playSound(soundKey) {
    try {
      if (this.sounds[soundKey]) {
        this.sounds[soundKey].play();
      }
    } catch (error) {
      console.warn(`Could not play ${soundKey} sound:`, error);
    }
  }
}
