import Phaser from "phaser";

export default class LogoScene extends Phaser.Scene {
  constructor() {
    super("LogoScene");
  }

  preload() {
    this.load.image("logo", "/assets/logo.png");
    this.load.audio("intro", "/assets/sounds/intro.mp3");
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
      .setOrigin(0, 0)
      .setAlpha(0.7);

    // Add logo to the center of the screen
    const logo = this.add.image(this.scale.width / 2, this.scale.height / 2 - 50, "logo");
    
    // Make the logo appear with a fade-in effect
    logo.setAlpha(0);
    
    // Play intro sound if available
    try {
      const introSound = this.sound.add("intro");
      introSound.play();
    } catch (error) {
      console.warn("Could not play intro sound:", error);
    }
    
    // Fade in the logo
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 1500,
      ease: "Power2",
      onComplete: () => {
        // Function to continue to next scene
        const continueToNextScene = () => {
          this.scene.start("MissionScene");
        };
        
        // After logo appears fully, add click handler to continue
        this.input.once("pointerdown", continueToNextScene);
        
        // Also allow pressing Enter to continue
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.once('down', continueToNextScene);
        
        // Add text to indicate what to do - now in the center below the logo
        const clickText = this.add.text(
          this.scale.width / 2,
          this.scale.height / 2 + 80, // Positioned below the logo
          "Klicken oder ENTER drücken um fortzufahren",
          {
            font: "24px Arial",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
          }
        ).setOrigin(0.5);
        
        // Make the text pulse to draw attention
        this.tweens.add({
          targets: clickText,
          alpha: { from: 0.5, to: 1 },
          duration: 800,
          yoyo: true,
          repeat: -1
        });
      }
    });
  }
}
