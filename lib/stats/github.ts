import type { HypeStatsSnapshot } from "@/lib/ai/stats-snapshot-prompt";

const GITHUB_Q_MAX = 220;

function truncateForGithubQuery(term: string): string {
  const t = term.trim();
  if (t.length <= GITHUB_Q_MAX) return t;
  return t.slice(0, GITHUB_Q_MAX);
}

async function githubRepoSearch(
  q: string,
  headers: Record<string, string>,
): Promise<number | null> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&per_page=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...headers,
    },
  });

  if (!res.ok) {
    console.warn(
      "[stats/github] search failed:",
      res.status,
      await res.text().catch(() => ""),
    );
    return null;
  }

  const data = (await res.json()) as { total_count?: number };
  return typeof data.total_count === "number" ? data.total_count : null;
}

/** Total matching repos + repos created in the last 30 days (search API). */
export async function fetchGithubRepoSnapshot(
  term: string,
): Promise<HypeStatsSnapshot["github"]> {
  const base = truncateForGithubQuery(term);
  if (!base) return null;

  const token = process.env.GITHUB_TOKEN?.trim();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [totalRepoCount, recent30DayRepoCount] = await Promise.all([
    githubRepoSearch(base, authHeaders),
    githubRepoSearch(`${base} created:>${thirtyDaysAgo}`, authHeaders),
  ]);

  if (totalRepoCount === null || recent30DayRepoCount === null) {
    return null;
  }

  return {
    totalRepoCount,
    recent30DayRepoCount,
  };
}
