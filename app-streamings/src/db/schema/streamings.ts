import { pgTable, text } from 'drizzle-orm/pg-core';

export const streamings = pgTable('streamings', {
  id: text().primaryKey(),
  name: text().notNull(),
});
