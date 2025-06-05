import { broker } from '../broker.ts';

export const users = await broker.createChannel();

await users.assertQueue('users');
