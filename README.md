# TechJobWatch

## Description

A lookout over the Serbian IT job market. TechJobWatch scrapes every JavaScript-related posting from [helloworld.rs](https://helloworld.rs), [joberty.com](https://joberty.com), and [infostud.com](https://www.infostud.com) every morning, and puts them in a single filterable dashboard.
Personal job-hunt tool first, public site second.

## Features

- **Daily Scraping:** Three Serbian job boards scraped every morning via GitHub Actions, with polite rate-limiting and identifiable user-agent.
- **Cross-Source Deduplication:** The same posting on multiple boards is shown once, keyed by slugified title and company.
- **Date Grouping:** Jobs are grouped by the date they were first discovered.
- **URL-Driven Filters:** Filter by source, seniority, remote, or free-text search across title, company, and tags.
- **Pagination:** Server-rendered pagination preserves all active filters.
- **Saved & Applied Tracking:** Save jobs and mark them as applied, with personal notes per job, all backed by GitHub authentication.
- **Soft-Expire Sweep:** Postings that disappear from their source board get marked expired automatically; rows older than 6 months are cleaned up weekly.
- **Light & Dark Theme:** System default with manual override.
- **GitHub Authentication:** Secure login powered by Better Auth.

## Technologies used

- **[Next.js 16](https://nextjs.org/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS 4](https://tailwindcss.com/)**
- **[Drizzle ORM](https://orm.drizzle.team/)**
- **[Neon Postgres](https://neon.tech/)**
- **[Better Auth](https://www.better-auth.com/)**
- **[Cheerio](https://cheerio.js.org/)**
- **[GitHub Actions](https://github.com/features/actions)**
- **[next-themes](https://github.com/pacocoursey/next-themes)**
- **[Vercel](https://vercel.com/)**
