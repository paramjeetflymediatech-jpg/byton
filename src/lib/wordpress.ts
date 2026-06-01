// src/lib/wordpress.ts

/**
 * Simple utility functions for interacting with a WordPress REST API.
 * Assumes the server supports the standard WP JSON endpoints.
 */

export async function fetchAll<T>(
  baseUrl: string,
  endpoint: string,
  extraParams: Record<string, string> = {}
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = 100; // WP max per_page
  while (true) {
    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      ...extraParams,
    });
    const url = `${baseUrl}${endpoint}?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch ${url}: ${resp.status}`);
    }
    const data: T[] = await resp.json();
    if (data.length === 0) break;
    results.push(...data);
    if (data.length < perPage) break; // last page
    page++;
  }
  return results;
}

export async function fetchWordPressJson<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  }
  return resp.json();
}
