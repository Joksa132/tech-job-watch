import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  sourceId: text('source_id').notNull(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  companySlug: text('company_slug').notNull(),
  location: text('location'),
  remote: boolean('remote').default(false),
  seniority: text('seniority'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: text('salary_currency'),
  listRank: integer('list_rank'),
  postedAt: timestamp('posted_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  expiredAt: timestamp('expired_at', { withTimezone: true }),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull(),
}, (t) => [
  index('source_idx').on(t.source),
  index('company_slug_idx').on(t.companySlug),
  index('expired_at_idx').on(t.expiredAt),
]);

export const savedJobs = pgTable(
  'saved_jobs',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    jobId: text('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('saved'), // 'saved' | 'applied'
    notes: text('notes'),
    appliedAt: timestamp('applied_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.jobId] })],
);
