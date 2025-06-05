import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { streamingProgress } from '../db/schema/streaming-progress.ts';
import { streamings } from './channels/streamings.ts';

streamings.consume(
  'start-streaming-queue',
  async (message) => {
    if (!message) return null;

    console.log('start-streaming-queue');

    const { userId, streamingId } = JSON.parse(message.content.toString());

    await db.insert(streamingProgress).values({ userId, streamingId });

    streamings.ack(message);
  },
  { noAck: false }
);

streamings.consume(
  'stop-streaming-queue',
  async (message) => {
    if (!message) return null;

    console.log('stop-streaming-queue');

    const { userId, streamingId, progress } = JSON.parse(
      message.content.toString()
    );

    await db
      .update(streamingProgress)
      .set({ progress })
      .where(
        and(
          eq(streamingProgress.userId, userId),
          eq(streamingProgress.streamingId, streamingId)
        )
      );

    streamings.ack(message);
  },
  { noAck: false }
);
