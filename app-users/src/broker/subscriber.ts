import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { streamingProgress } from '../db/schema/streaming-progress.ts';
import { streamings } from './channels/streamings.ts';
import { trace } from '@opentelemetry/api';
import { tracer } from '../tracer/tracer.ts';
import { setTimeout } from 'node:timers/promises';

streamings.consume(
  'start-streaming-queue',
  async (message) => {
    if (!message) return null;

    const { userId, streamingId } = JSON.parse(message.content.toString());

    trace
      .getActiveSpan()
      ?.setAttribute('user_id', userId)
      .setAttribute('streaming_id', streamingId);

    const span = tracer.startSpan('Começo do span');

    span.setAttribute('atributo', 'valor');

    await setTimeout(2000);

    span.end();

    const [progressFound] = await db
      .select()
      .from(streamingProgress)
      .where(
        and(
          eq(streamingProgress.userId, userId),
          eq(streamingProgress.streamingId, streamingId)
        )
      );

    if (!progressFound) {
      await db.insert(streamingProgress).values({ userId, streamingId });
    } else {
      await db
        .update(streamingProgress)
        .set({ progress: 0 })
        .where(
          and(
            eq(streamingProgress.userId, userId),
            eq(streamingProgress.streamingId, streamingId)
          )
        );
    }

    streamings.ack(message);
  },
  { noAck: false }
);

streamings.consume(
  'stop-streaming-queue',
  async (message) => {
    if (!message) return null;

    const { userId, streamingId, progress } = JSON.parse(
      message.content.toString()
    );

    trace
      .getActiveSpan()
      ?.setAttribute('user_id', userId)
      .setAttribute('streaming_id', streamingId);

    const span = tracer.startSpan('Começo do span');

    span.setAttribute('atributo', 'valor');

    await setTimeout(2000);

    span.end();

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
