import fetch from "node-fetch";
import { log } from "./logging";

export async function fetchJsonWithRetry<T>(url: string, options?: RequestInit, retries = 3, backoff = 500): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s
    const res = await fetch(url, { ...options, signal: controller.signal } as any);
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      if (retries > 0 && [429, 500, 502, 503, 504].includes(res.status)) {
        log("warn", `⚠️ Error ${res.status} en ${url}, reintentando en ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return fetchJsonWithRetry<T>(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP error ${res.status} en ${url}: ${text}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0) {
      log("warn", `⚠️ Fetch falló, reintentando en ${backoff}ms...`, err);
      await new Promise(r => setTimeout(r, backoff));
      return fetchJsonWithRetry<T>(url, options, retries - 1, backoff * 2);
    }
    log("error", `❌ Fetch definitivo falló en ${url}`, err);
    throw err;
  }
}
