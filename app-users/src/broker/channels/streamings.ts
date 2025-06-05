import { broker } from '../broker.ts';

export const streamings = await broker.createChannel();

await streamings.assertQueue('start-streaming-queue');
await streamings.assertQueue('stop-streaming-queue');
