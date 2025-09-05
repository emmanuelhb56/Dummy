export function log(level: "info" | "warn" | "error", msg: string, data?: any): void {
  console[level](`[${new Date().toISOString()}] ${msg}`, data ? { ...data } : undefined);
}