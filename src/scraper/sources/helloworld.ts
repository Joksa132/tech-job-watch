import { load } from "cheerio";
import { fetchHtml, slugify, type RawJob } from "../lib";

const BASE = "https://www.helloworld.rs";
const QUERY = "?q=javascript&scope=full&sort=p_vreme_postavljanja_sort";
const SCRAPE_LIMIT = process.env.SCRAPE_LIMIT
  ? parseInt(process.env.SCRAPE_LIMIT, 10)
  : Infinity;

export async function scrape(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const PAGE_SIZE = 30;
  let offset = 0;
  while (out.length < SCRAPE_LIMIT) {
    const url =
      offset === 0
        ? `${BASE}/oglasi-za-posao${QUERY}`
        : `${BASE}/oglasi-za-posao/stranica/${offset}${QUERY}`;
    console.log(`[helloworld] offset ${offset}`);
    const $ = load(await fetchHtml(url));
    const cards = $(".__search-results > div").filter(
      (_, el) => $(el).find('a[href*="/posao/"]').length > 0,
    );
    if (cards.length === 0) break;

    for (const el of cards.toArray()) {
      if (out.length >= SCRAPE_LIMIT) break;
      const listRank = out.length;
      const $c = $(el);

      const titleLink = $c.find("a.__ga4_job_title").first();
      const sourceId = titleLink.attr("data-job-id");
      const title = titleLink.text().trim();
      const href = titleLink.attr("href");
      if (!sourceId || !title || !href) continue;

      const detailUrl = href.startsWith("http")
        ? href.split("?")[0]
        : `${BASE}${href.split("?")[0]}`;
      const companyFromText = $c
        .find("a.__ga4_job_company")
        .first()
        .text()
        .trim();
      const company = companyFromText || companyFromHref(href) || "Unknown";

      const locationText = $c
        .find(".la-map-marker")
        .parent()
        .find("p")
        .first()
        .text()
        .trim();
      const [locationName, mode] = locationText.split("|").map((s) => s.trim());
      const remote = /remote|home/i.test(`${mode ?? ""} ${locationText}`);
      const isModeOnly =
        /^(remote|hibrid|hybrid|onsite|on-site|home|work from home)$/i.test(
          locationName ?? "",
        );
      const location = !locationName || isModeOnly ? null : locationName;

      const dateText = $c
        .find(".la-clock")
        .parent()
        .find("p")
        .first()
        .text()
        .trim();
      const dm = dateText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      const expiresAt = dm ? new Date(+dm[3], +dm[2] - 1, +dm[1]) : null;

      const tags = $c
        .find(".__ga4_job_tech_tag")
        .map((_, t) => $(t).text().trim().toLowerCase())
        .get()
        .filter(Boolean);

      const seniorityRaw = $c
        .find(".__ga4_job_seniority")
        .first()
        .text()
        .trim()
        .toLowerCase();
      const seniority =
        seniorityRaw === "intermediate" ? "medior" : seniorityRaw || "unknown";

      const salaryText = $c
        .find(".la-coins")
        .parent()
        .find("span")
        .first()
        .text()
        .trim();
      const sm = salaryText.match(/([\d.,]+)\s*-\s*([\d.,]+)\s*([A-Z]{3})/);
      const toNum = (x: string) =>
        parseInt(x.split(",")[0].replace(/\./g, ""), 10);
      const salary = sm
        ? { min: toNum(sm[1]), max: toNum(sm[2]), currency: sm[3] }
        : null;

      out.push({
        source: "helloworld",
        sourceId,
        url: detailUrl,
        title,
        company,
        companySlug: slugify(company),
        location,
        remote,
        seniority,
        tags,
        salaryMin: salary?.min ?? null,
        salaryMax: salary?.max ?? null,
        salaryCurrency: salary?.currency ?? null,
        listRank,
        postedAt: new Date(),
        expiresAt,
      });
    }
    offset += PAGE_SIZE;
  }
  return out;
}

function companyFromHref(href: string): string | null {
  const segs = href.split("?")[0].split("/").filter(Boolean);
  if (segs[0] === "posao" && segs.length >= 3) {
    return segs[2].replace(/-/g, " ");
  }
  return null;
}
