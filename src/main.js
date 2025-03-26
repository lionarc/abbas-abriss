import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  width: 1168,
  height: 560,
  backgroundColor: '#a0d0ff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene]
}

new Phaser.Game(config)