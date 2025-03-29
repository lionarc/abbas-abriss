import Phaser from 'phaser'
import LogoScene from './scenes/LogoScene.js'
import MissionScene from './scenes/MissionScene.js'
import NameEntryScene from './scenes/NameEntryScene.js'
import GameScene from './scenes/GameScene.js'
import EndGameScene from './scenes/EndGameScene.js'

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
  scene: [LogoScene, MissionScene, NameEntryScene, GameScene, EndGameScene],
  // Scale manager configuration
  scale: {
    mode: Phaser.Scale.FIT,  // Automatically scale the game to fit inside the parent
    parent: 'game-container', // Optional: Create a div with this ID to contain the game
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
  },
  // Input configuration to ensure keyboard events work properly
  input: {
    keyboard: {
      capture: [
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
        Phaser.Input.Keyboard.KeyCodes.Q,
        Phaser.Input.Keyboard.KeyCodes.E,
        Phaser.Input.Keyboard.KeyCodes.I,
        Phaser.Input.Keyboard.KeyCodes.J,
        Phaser.Input.Keyboard.KeyCodes.K,
        Phaser.Input.Keyboard.KeyCodes.L,
        Phaser.Input.Keyboard.KeyCodes.O,
        Phaser.Input.Keyboard.KeyCodes.U,
        Phaser.Input.Keyboard.KeyCodes.ENTER,
        Phaser.Input.Keyboard.KeyCodes.ESC   // Add ESC key to the captured keys
      ]
    }
  },
  autoRound: false // Prevent rounding which can cause scaling artifacts
}

// Initialize the game instance
const game = new Phaser.Game(config);

// Expose the game globally for debugging (optional)
window.game = game;