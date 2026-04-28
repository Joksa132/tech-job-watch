import { pgTable, text, integer, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

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
  description: text('description'),
  rawHtml: text('raw_html'),
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
  index('posted_at_idx').on(t.postedAt),
  index('company_slug_idx').on(t.companySlug),
  index('expired_at_idx').on(t.expiredAt),
]);
