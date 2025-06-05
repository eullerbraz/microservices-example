import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifyCors from '@fastify/cors';

import { z } from 'zod';
import { dispatchStreamingStart } from '../broker/messages/streaming-start.ts';
import { dispatchStreamingStop } from '../broker/messages/streaming-stop.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: '*' });

app.get('/health', (_req, _res) => {
  return 'OK';
});

app.post(
  '/start-streaming',
  {
    schema: {
      body: z.object({
        userId: z.string(),
        streamingId: z.string(),
      }),
    },
  },
  async (req, res) => {
    const { streamingId, userId } = req.body;

    dispatchStreamingStart({ streamingId, userId });

    return res.status(201).send();
  }
);

app.post(
  '/stop-streaming',
  {
    schema: {
      body: z.object({
        userId: z.string(),
        streamingId: z.string(),
        progress: z.number().int(),
      }),
    },
  },
  async (req, res) => {
    const { streamingId, userId, progress } = req.body;

    dispatchStreamingStop({ streamingId, userId, progress });

    return res.status(201).send();
  }
);

app.listen({ host: '0.0.0.0', port: 3334 }).then(() => {
  console.log('[Streamings] HTTP server running');
});
