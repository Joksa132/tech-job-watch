export type RawJob = {
  source: "helloworld" | "joberty" | "infostud";
  sourceId: string;
  url: string;
  title: string;
  company: string;
  companySlug: string;
  location: string | null;
  remote: boolean;
  seniority: string;
  tags: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  listRank: number;
  postedAt: Date;
  expiresAt: Date | null;
};

export const USER_AGENT =
  "tech-job-watch/1.0 (+https://github.com/Joksa132/tech-job-watch; nikolajoksimovic419@gmail.com)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastFetch = 0;

export async function fetchHtml(url: string): Promise<string> {
  const wait = Math.max(0, 5000 - (Date.now() - lastFetch));
  if (wait > 0) await sleep(wait);
  for (let attempt = 0; ; attempt++) {
    lastFetch = Date.now();
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 3)
        throw new Error(`${res.status} for ${url} after 3 retries`);
      const backoff = 1000 * 2 ** attempt;
      console.warn(`${res.status}, retrying in ${backoff}ms: ${url}`);
      await sleep(backoff);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.text();
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
