import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type TPTZCommand =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'stop'
  | 'zoomIn'
  | 'zoomOut';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e7,
  namespace: '/relay',
})
@Injectable()
export class RelayGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private relays: Map<string, string> = new Map();

  afterInit() {
    console.log('RelayGateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected (relay): ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected (relay): ${client.id}`);

    // Remove relay if it was disconnected
    for (const [relayId, socketId] of this.relays.entries()) {
      if (socketId === client.id) {
        this.relays.delete(relayId);
        console.log(`Relay disconnected: ${relayId}`);
        break;
      }
    }
  }

  @SubscribeMessage('relayConnect')
  handleRelayConnect(client: Socket, connectMessage: { relayId: string }) {
    const { relayId } = connectMessage;
    this.relays.set(relayId, client.id);

    client.on(
      'relayRtc',
      (relayRtcMessage: { clientId: string; [key: string]: any }) => {
        const { clientId, ...rest } = relayRtcMessage;
        this.server.to(clientId).emit('relayRtc', { ...rest });
      },
    );
  }

  @SubscribeMessage('requestStream')
  async handleRequestStream(
    client: Socket,
    requestMessage: { relayId: string; rtsp: string },
  ) {
    const { relayId, rtsp } = requestMessage;

    if (!this.relays.has(relayId)) {
      client.emit('relayNotOnline');
      return;
    }

    const relaySocketId = this.relays.get(relayId);
    await this.server.to(relaySocketId).emit('clientRtc', {
      type: 'ready',
      clientId: client.id,
      rtsp,
    });

    client.on('clientRtc', async (clientRtcMessage: { [key: string]: any }) => {
      await this.server.to(relaySocketId).emit('clientRtc', {
        ...clientRtcMessage,
        clientId: client.id,
      });
    });

    client.on('disconnectStream', () => {
      this.server.to(relaySocketId).emit('clientRtc', {
        type: 'disconnect',
        clientId: client.id,
      });
    });

    client.on('disconnect', () => {
      this.server.to(relaySocketId).emit('clientRtc', {
        type: 'disconnect',
        clientId: client.id,
      });
    });
  }

  @SubscribeMessage('ptzCommand')
  async handlePtzCommand(
    client: Socket,
    ptzMessage: {
      relayId: string;
      command: TPTZCommand;
      speed?: number;
      rtsp: string;
    },
  ) {
    const { relayId, command } = ptzMessage;

    if (!this.relays.has(relayId)) {
      client.emit('relayNotOnline');
      return;
    }

    const relaySocketId = this.relays.get(relayId);

    await this.server.to(relaySocketId).emit('ptzCommand', {
      command,
      speed: ptzMessage.speed || 1,
      rtsp: ptzMessage.rtsp,
    });
  }
}
