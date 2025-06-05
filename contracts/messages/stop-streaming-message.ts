export interface StopStreamingMessage {
  userId: string;
  streamingId: string;
  progress: number;
}
