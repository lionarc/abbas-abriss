import Phaser from "phaser";

export default class VitalitySystem {
  constructor(player) {
    this.player = player;
    this.scene = player.scene;
    
    // Vitality properties
    this.vitality = 100;
    this.vitalityDecayRate = 2; // How fast vitality depletes when moving (per second)
    this.vitalityRecoveryRate = 1; // How fast vitality recovers when standing still (per second)
    
    // Coffee effect properties
    this.coffeeEffectTimer = null;
    this.coffeeEffectActive = false;
    this.coffeeIcon = null;
    this.coffeeDuration = 20000; // Increased to 20 seconds (from 15)

    // Store the original player scale for resetting after coffee effect
    this.originalPlayerScale = player.sprite.scale;
  }
  
  update(delta, isMoving) {
    // Convert delta (ms) to seconds
    const deltaSeconds = delta / 1000;
    
    if (isMoving) {
      // Decrease vitality when moving, unless coffee effect is active
      if (!this.coffeeEffectActive) {
        this.vitality -= this.vitalityDecayRate * deltaSeconds;
      }
    } else {
      // Recover vitality when standing still
      this.vitality += this.vitalityRecoveryRate * deltaSeconds;
    }
    
    // Ensure vitality stays within bounds
    this.vitality = Phaser.Math.Clamp(this.vitality, 0, 100);
  }
  
  addVitality(amount) {
    this.vitality = Math.min(this.vitality + amount, 100);
  }
  
  reduceVitality(amount) {
    if (this.coffeeEffectActive) return false; // No vitality loss with coffee effect
    
    this.vitality = Math.max(this.vitality - amount, 0);
    return true;
  }
  
  applyCoffeeEffect() {
    if (!this.coffeeEffectActive) {
      this.coffeeEffectActive = true;
      
      // Add visual indicator for coffee effect
      if (!this.coffeeIcon) {
        this.coffeeIcon = this.scene.add.text(
          this.player.sprite.x, 
          this.player.sprite.y - 50, 
          "☕", 
          { font: "20px Arial", stroke: "#000", strokeThickness: 2 }
        ).setOrigin(0.5);
      } else {
        this.coffeeIcon.setVisible(true);
      }
      
      // Add energy boost - larger boost of 50 points
      this.addVitality(50);
      
      console.log(`☕ Player ${this.player.playerId + 1} got energy boost and is immune to energy loss for 20 seconds!`);
      
      // Show duration message to player
      const durationText = this.scene.add.text(
        this.player.sprite.x,
        this.player.sprite.y - 80,
        "20s Energieschutz!",
        {
          font: "14px Arial",
          fill: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3
        }
      ).setOrigin(0.5);
      
      // Fade out the duration message
      this.scene.tweens.add({
        targets: durationText,
        alpha: 0,
        y: durationText.y - 20,
        duration: 2000,
        onComplete: () => durationText.destroy()
      });
      
      // Cancel existing timer if there is one
      if (this.coffeeEffectTimer) {
        this.coffeeEffectTimer.remove();
      }
      
      // Set timer to remove coffee effect after 20 seconds
      this.coffeeEffectTimer = this.scene.time.delayedCall(
        this.coffeeDuration, // 20 seconds
        this.removeCoffeeEffect,
        [],
        this
      );
      
      // Add a pulse animation instead of scaling up the player permanently
      this.scene.tweens.add({
        targets: this.player.sprite,
        scale: { from: this.originalPlayerScale * 1.2, to: this.originalPlayerScale },
        duration: 300,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: 1
      });
    }
  }
  
  removeCoffeeEffect() {
    this.coffeeEffectActive = false;
    
    // Reset the player scale to original size
    this.player.sprite.setScale(this.originalPlayerScale);
    
    if (this.coffeeIcon) {
      this.coffeeIcon.setVisible(false);
    }
    
    console.log(`☕ Player ${this.player.playerId + 1}'s coffee effect has worn off.`);
    
    // Show expired message to player
    const expiredText = this.scene.add.text(
      this.player.sprite.x,
      this.player.sprite.y - 50,
      "Kaffee-Effekt vorbei!",
      {
        font: "14px Arial",
        fill: "#ff9900",
        stroke: "#000000",
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    
    // Fade out the expired message
    this.scene.tweens.add({
      targets: expiredText,
      alpha: 0,
      y: expiredText.y - 20,
      duration: 2000,
      onComplete: () => expiredText.destroy()
    });
  }
  
  isExhausted() {
    return this.vitality < 10;
  }
}
