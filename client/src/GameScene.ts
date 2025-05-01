import { Client, getStateCallbacks, Room } from 'colyseus.js';
import Phaser from 'phaser';
import { MoveMessage } from './common/models';

export default class GameScene extends Phaser.Scene {
    private client: Client;
    private room?: Room;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private player?: Phaser.Physics.Arcade.Sprite;
    private otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

    constructor() {
        super({ key: 'GameScene' });
        this.client = new Client('ws://localhost:2567');
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.image('player', 'assets/player.png');
    }

    create() {
        this.connectToRoom();

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('ground', 'tileset');
        if (!tileset) {
            console.error('Tileset not found');
            return;
        }

        const foregroundLayer = map.createLayer('Tile Layer 1', tileset);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        foregroundLayer?.setCollisionByProperty({ collides: true });

        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard?.createCursorKeys();

        // camera
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setDeadzone(100, 100);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    async connectToRoom() {
        try {
            this.room = await this.client.joinOrCreate('my_room');
            const $ = getStateCallbacks(this.room);

            $(this.room.state).players.onAdd((player, sessionId) => {
                if (sessionId === this.room?.sessionId) {
                    return;
                }

                const sprite = this.physics.add.sprite(400, 300, 'player');
                this.otherPlayers.set(sessionId, sprite);

                $(player).onChange(() => {
                    const otherPlayer = this.otherPlayers.get(sessionId);
                    if (otherPlayer) {
                        otherPlayer.setPosition(player.x, player.y);
                    }
                });
            });

            $(this.room.state).players.onRemove((player, sessionId) => {
                const otherPlayer = this.otherPlayers.get(sessionId);

                if (otherPlayer) {
                    otherPlayer.destroy();
                    this.otherPlayers.delete(sessionId);
                }
            });

            // Set up message listeners
            this.room.onMessage('*', (type, message) => {
                console.log('Received message:', type, message);
            });

            // Set up state change listeners
            this.room.onStateChange((state) => {
                console.log('State changed:', state.players);
            });

            // Handle room errors
            this.room.onError((code, message) => {
                console.error('Room error:', code, message);
            });

            // Handle when we leave the room
            this.room.onLeave((code) => {
                console.log('Left room:', code);
            });
        } catch (error) {
            console.error('Failed to join room:', error);
        }
    }

    // Example method to send a message to the server
    sendMessage(type: string, message: any) {
        if (this.room) {
            this.room.send(type, message);
        }
    }
    update() {
        if (!this.player || !this.room || !this.cursors) {
            return;
        }

        this.adjustCamera();
        const velocity = this.getPlayerMovement();
        this.player.setVelocity(velocity.x, velocity.y);

        // Only send position to server if the player is actually moving
        if (velocity.x !== 0 || velocity.y !== 0) {
            this.room.send('move', { x: this.player.x, y: this.player.y });
        }
    }

    private adjustCamera() {
        if (!this.player || !this.cursors) {
            return;
        }
    }

    private getPlayerMovement(): MoveMessage {
        if (!this.player || !this.room || !this.cursors) {
            return { x: 0, y: 0 };
        }

        const speed = 200;

        // Move local player
        const velocity = { x: 0, y: 0 };
        if (this.cursors.left.isDown) velocity.x = -speed;
        else if (this.cursors.right.isDown) velocity.x = speed;
        if (this.cursors.up.isDown) velocity.y = -speed;
        else if (this.cursors.down.isDown) velocity.y = speed;

        // Normalize diagonal movement (optional but recommended)
        if (velocity.x !== 0 && velocity.y !== 0) {
            const factor = 1 / Math.sqrt(2);
            velocity.x *= factor;
            velocity.y *= factor;
        }

        return { x: velocity.x, y: velocity.y };
    }
}
