import Phaser from 'phaser';
import GameScene from './GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true, // Crisp pixel art rendering
    physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [GameScene],
    input: {
        keyboard: true,
    },
};

// Initialize game
new Phaser.Game(config);
