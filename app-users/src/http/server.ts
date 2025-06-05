import '@opentelemetry/auto-instrumentations-node/register';

import '../broker/subscriber.ts';

import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { channels } from '../broker/channels/index.ts';
import fastifyCors from '@fastify/cors';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: '*' });

app.get('/health', (_req, _res) => {
  return 'OK';
});

app.get('/users', async (req, res) => {
  channels.users.sendToQueue('users', Buffer.from('Hello word'));

  return res.status(200).send();
});

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Users] HTTP server running');
});
