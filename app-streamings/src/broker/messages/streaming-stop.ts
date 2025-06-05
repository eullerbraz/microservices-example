import type { StopStreamingMessage } from '../../../../contracts/messages/stop-streaming-message.ts';
import { channels } from '../channels/index.ts';

export function dispatchStreamingStop(data: StopStreamingMessage) {
  channels.streamings.sendToQueue(
    'stop-streaming-queue',
    Buffer.from(JSON.stringify(data))
  );
}
