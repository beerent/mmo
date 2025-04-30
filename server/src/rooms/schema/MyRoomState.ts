import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') sessionId: string;

  constructor(sessionId: string, x: number = 0, y: number = 0) {
    super();

    this.sessionId = sessionId;
    this.x = x;
    this.y = y;
  }
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  createPlayer(sessionId: string) {
    this.players.set(sessionId, new Player(sessionId));
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  updatePlayerPosition(sessionId: string, x: number, y: number) {
    const player = this.players.get(sessionId);

    if (player) {
      player.x = x;
      player.y = y;
    }
  }
}
