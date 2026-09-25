import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { TrackingCheckpoint } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

export function useTrackingSocket(
  trackingCode: string,
  onUpdate: (checkpoint: TrackingCheckpoint) => void
) {
  useEffect(() => {
    if (!trackingCode) return;

    const socket = io(WS_URL, { transports: ['websocket'] });

    socket.emit('join_tracking', { trackingCode });
    socket.on('tracking_update', (payload: TrackingCheckpoint) => {
      onUpdate(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [trackingCode, onUpdate]);
}
