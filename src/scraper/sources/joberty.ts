import { fetchHtml, slugify, type RawJob } from "../lib";

const API = "https://backend.joberty.com/api/v1/jobs";
const SITE = "https://www.joberty.com";
const QUERY = "?search=javascript&sort=created";
const SCRAPE_LIMIT = process.env.SCRAPE_LIMIT
  ? parseInt(process.env.SCRAPE_LIMIT, 10)
  : Infinity;

type JobertyJob = {
  id: number;
  jobTitle: string;
  companyName: string;
  companyUrlName: string;
  cities: string[];
  technologies?: string[];
  seniority?: string;
  expirationDate: number; // ms since epoch
};

type SearchResponse = {
  totalElements: number;
  totalPage: number;
  items: JobertyJob[];
};

export async function scrape(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  let page = 1;
  let totalPage = Infinity;

  while (out.length < SCRAPE_LIMIT && page <= totalPage) {
    const url = `${API}${QUERY}&page=${page}`;
    console.log(`[joberty] page ${page}`);
    const json: SearchResponse = JSON.parse(await fetchHtml(url));
    totalPage = json.totalPage;
    if (!json.items?.length) break;

    for (const j of json.items) {
      if (out.length >= SCRAPE_LIMIT) break;
      out.push(toRawJob(j, out.length));
    }
    page++;
  }
  return out;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function toRawJob(j: JobertyJob, listRank: number): RawJob {
  const company = (j.companyName ?? "").trim() || "Unknown";
  const cleanCities = (j.cities ?? []).map((c) =>
    c.replace(/\s*\(.*?\)\s*$/, "").trim(),
  );
  const isRemoteOnly =
    cleanCities.length > 0 && cleanCities.every((c) => /^remote$/i.test(c));
  const primaryCity = cleanCities.find((c) => !/^remote$/i.test(c)) ?? null;
  const remote = (j.cities ?? []).some((c) => /remote/i.test(c));

  const senRaw = (j.seniority ?? "").split(",")[0].trim().toLowerCase();
  const seniority =
    senRaw === "intermediate"
      ? "medior"
      : senRaw === "junior" || senRaw === "senior" || senRaw === "medior"
        ? senRaw
        : "unknown";

  const expiresAt = j.expirationDate ? new Date(j.expirationDate) : null;
  const postedAt = expiresAt
    ? new Date(expiresAt.getTime() - THIRTY_DAYS_MS)
    : new Date();

  return {
    source: "joberty",
    sourceId: String(j.id),
    url: `${SITE}/sr/companies/${j.companyUrlName}/jobs/${j.id}`,
    title: j.jobTitle,
    company,
    companySlug: j.companyUrlName || slugify(company),
    location: isRemoteOnly ? null : primaryCity,
    remote,
    seniority,
    tags: (j.technologies ?? []).map((t) => t.toLowerCase()),
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    listRank,
    postedAt,
    expiresAt,
  };
}
