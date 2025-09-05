import fetch from "node-fetch";

export async function fetchJson<T>(url: string, options?: RequestInit, retries = 3, backoff = 500): Promise<T> {
  try {
    const res = await fetch(url, options as import("node-fetch").RequestInit);
    if (!res.ok) {
      const text = await res.text();
      if (retries > 0 && [429, 500, 502, 503, 504].includes(res.status)) {
        console.warn(`⚠️ Error ${res.status} en ${url}, reintentando en ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return fetchJson<T>(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP error ${res.status} en ${url}: ${text}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ Fetch falló, reintentando en ${backoff}ms...`, err);
      await new Promise(r => setTimeout(r, backoff));
      return fetchJson<T>(url, options, retries - 1, backoff * 2);
    }
    console.error(`❌ Fetch definitivo falló en ${url}:`, err);
    throw err;
  }
}
