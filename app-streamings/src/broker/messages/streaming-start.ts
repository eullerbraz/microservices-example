import type { StartStreamingMessage } from '../../../../contracts/messages/start-streaming-message.ts';
import { channels } from '../channels/index.ts';

export function dispatchStreamingStart(data: StartStreamingMessage) {
  channels.streamings.sendToQueue(
    'start-streaming-queue',
    Buffer.from(JSON.stringify(data))
  );
}
