import { load } from "cheerio";
import { fetchHtml, slugify, SCRAPE_LIMIT, type RawJob } from "../lib";

const BASE = "https://poslovi.infostud.com";
const QUERY = "?scope=full&sort=online_view_date";

type InfostudJob = {
  id: number;
  title: string;
  companyName: string;
  location: string | null;
  workFromHome?: boolean;
  hybridWork?: boolean;
  itTags?: string[];
  onlineViewDate?: string; // DD.MM.YYYY
  expirationDate?: string; // DD.MM.YYYY
  url: string;
};

type SearchResults = {
  totalPrimaryItems: number;
  jobs: { primary: InfostudJob[] };
};

export async function scrape(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  let page = 1;
  let total = Infinity;

  while (out.length < SCRAPE_LIMIT && out.length < total) {
    const url = `${BASE}/oglasi-za-posao-javascript${QUERY}${
      page > 1 ? `&page=${page}` : ""
    }`;
    console.log(`[infostud] page ${page}`);
    const $ = load(await fetchHtml(url));
    const dataScript = $("script#__NEXT_DATA__").html();
    if (!dataScript) {
      console.log("[infostud] no __NEXT_DATA__ found, stopping");
      break;
    }
    const r: SearchResults | undefined =
      JSON.parse(dataScript)?.props?.pageProps?.initialSearchResults;
    if (!r?.jobs?.primary) {
      console.log("[infostud] no results in JSON, stopping");
      break;
    }
    total = r.totalPrimaryItems;
    if (r.jobs.primary.length === 0) break;

    for (const j of r.jobs.primary) {
      if (out.length >= SCRAPE_LIMIT) break;
      if (!isRelevant(j)) continue;
      out.push(toRawJob(j, out.length));
    }
    page++;
  }
  return out;
}

function toRawJob(j: InfostudJob, listRank: number): RawJob {
  const company = j.companyName || "Unknown";
  const [locationName, mode] = (j.location ?? "")
    .split("|")
    .map((s) => s.trim());
  const isModeOnly =
    /^(rad od kuće|remote|hibrid|hybrid|na terenu|onsite|on-site)$/i.test(
      locationName ?? "",
    );
  const location = !locationName || isModeOnly ? null : locationName;
  const remote =
    j.workFromHome === true ||
    /remote|home|kuće/i.test(`${mode ?? ""} ${j.location ?? ""}`);

  return {
    source: "infostud",
    sourceId: String(j.id),
    url: j.url,
    title: j.title,
    company,
    companySlug: slugify(company),
    location,
    remote,
    seniority: "unknown",
    tags: (j.itTags ?? []).map((t) => t.toLowerCase()),
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    listRank,
    postedAt: parseDate(j.onlineViewDate) ?? new Date(),
    expiresAt: parseDate(j.expirationDate),
  };
}

function isRelevant(j: InfostudJob): boolean {
  if (j.itTags && j.itTags.length > 0) return true;
  return /javascript|typescript|node|frontend|backend|fullstack|full.stack|web|developer/i.test(j.title);
}

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1]);
}
