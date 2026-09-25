import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { TrackingCheckpoint } from '../../domain/entities/tracking-checkpoint';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join_tracking')
  handleJoinTracking(
    @MessageBody() payload: { trackingCode: string },
    client: Socket
  ): { joined: string } {
    client.join(payload.trackingCode);
    return { joined: payload.trackingCode };
  }

  emitTrackingUpdate(payload: TrackingCheckpoint): void {
    this.server.to(payload.trackingCode).emit('tracking_update', payload);
  }
}
