import { integer, pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const streamingProgress = pgTable(
  'streamings-progress',
  {
    userId: text()
      .notNull()
      .references(() => users.id),
    streamingId: text().notNull(),
    progress: integer().default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.streamingId] })]
);
