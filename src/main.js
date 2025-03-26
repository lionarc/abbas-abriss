import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'

// Base dimensions for the game (original design size)
const BASE_WIDTH = 1168;
const BASE_HEIGHT = 560;

// Set up scale configuration
const config = {
  type: Phaser.AUTO,
  backgroundColor: '#a0d0ff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene],
  // Scale manager configuration
  scale: {
    mode: Phaser.Scale.FIT,  // Automatically scale the game to fit inside the parent
    parent: 'game-container', // Optional: Create a div with this ID to contain the game
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
  },
  autoRound: false // Prevent rounding which can cause scaling artifacts
}

// Initialize the game instance
const game = new Phaser.Game(config);

// Expose the game globally for debugging (optional)
window.game = game;