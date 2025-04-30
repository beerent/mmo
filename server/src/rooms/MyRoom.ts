import { Room, Client } from '@colyseus/core';
import { MyRoomState } from './schema/MyRoomState';
import { MoveMessage } from '../common/models';

export class MyRoom extends Room<MyRoomState> {
  state = new MyRoomState();

  onCreate(options: any) {
    this.onMessage('test', (client, message) => {
      console.log(client, message);
    });

    this.onMessage('move', (client, message: MoveMessage) => {
      const sessionId = client.sessionId;
      this.state.updatePlayerPosition(sessionId, message.x, message.y);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}
