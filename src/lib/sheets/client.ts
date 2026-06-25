import { google, type sheets_v4 } from "googleapis";
import type { z } from "zod";
import type { SheetName } from "./schemas";
import { SHEET_HEADERS } from "./schemas";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface CacheEntry<T> { data: T; timestamp: number; ttl: number; }
const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 60_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) { cache.delete(key); return null; }
  return entry.data;
}
function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL_MS): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}
export function invalidateCache(prefix?: string): void {
  if (!prefix) { cache.clear(); return; }
  for (const key of cache.keys()) { if (key.startsWith(prefix)) cache.delete(key); }
}

function getAuth() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  return new google.auth.JWT({ email: SERVICE_ACCOUNT_EMAIL, key: PRIVATE_KEY, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
}

let sheetsInstance: sheets_v4.Sheets | null = null;
function getSheets(): sheets_v4.Sheets {
  if (!sheetsInstance) sheetsInstance = google.sheets({ version: "v4", auth: getAuth() });
  return sheetsInstance;
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); } catch (error: unknown) {
      const isRateLimit = error instanceof Error && "code" in error && (error as { code: number }).code === 429;
      const isServerError = error instanceof Error && "code" in error && (error as { code: number }).code >= 500;
      if (attempt === retries || (!isRateLimit && !isServerError)) throw error;
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500));
    }
  }
  throw new Error("withRetry: exhausted retries");
}

export async function getAll<T>(sheetName: SheetName, schema: z.ZodSchema<T>, options?: { bustCache?: boolean; ttl?: number }): Promise<T[]> {
  const cacheKey = `getAll:${sheetName}`;
  if (!options?.bustCache) { const cached = getCached<T[]>(cacheKey); if (cached) return cached; }
  const sheets = getSheets();
  const response = await withRetry(() => sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A1:Z10000` }));
  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];
  const headers = rows[0] as string[];
  const results: T[] = [];
  for (const row of rows.slice(1)) {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) { const h = headers[i]; if (h) obj[h] = (row[i] as string | undefined) ?? ""; }
    const parsed = schema.safeParse(obj);
    if (parsed.success) results.push(parsed.data);
    else console.warn(`[Sheets] Invalid row in ${sheetName}:`, parsed.error.issues);
  }
  setCache(cacheKey, results, options?.ttl ?? DEFAULT_TTL_MS);
  return results;
}

export async function getById<T>(sheetName: SheetName, schema: z.ZodSchema<T>, id: string): Promise<T | null> {
  const all = await getAll(sheetName, schema);
  return all.find((item) => (item as Record<string, unknown>).id === id) ?? null;
}

export async function create<T>(sheetName: SheetName, schema: z.ZodSchema<T>, data: Record<string, unknown>): Promise<T> {
  const headers = SHEET_HEADERS[sheetName];
  const values = headers.map((h) => String(data[h] ?? ""));
  const sheets = getSheets();
  await withRetry(() => sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A1`, valueInputOption: "RAW", requestBody: { values: [values] } }));
  invalidateCache(`getAll:${sheetName}`);
  return schema.parse(data);
}

export async function update<T>(sheetName: SheetName, schema: z.ZodSchema<T>, id: string, data: Partial<Record<string, unknown>>): Promise<T | null> {
  const sheets = getSheets();
  const response = await withRetry(() => sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A1:Z10000` }));
  const rows = response.data.values;
  if (!rows || rows.length < 2) return null;
  const headers = rows[0] as string[];
  const idColIndex = headers.indexOf("id");
  if (idColIndex === -1) throw new Error(`No 'id' column in ${sheetName}`);
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) { if (rows[i]?.[idColIndex] === id) { rowIndex = i; break; } }
  if (rowIndex === -1) return null;
  const existingRow = rows[rowIndex] as string[];
  const merged: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) { const h = headers[i]; if (h) merged[h] = (existingRow[i] as string | undefined) ?? ""; }
  for (const [key, value] of Object.entries(data)) merged[key] = String(value ?? "");
  const newValues = headers.map((h) => merged[h] ?? "");
  await withRetry(() => sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A${rowIndex + 1}`, valueInputOption: "RAW", requestBody: { values: [newValues] } }));
  invalidateCache(`getAll:${sheetName}`);
  const parsed = schema.safeParse(merged);
  return parsed.success ? parsed.data : null;
}

export async function softDelete(sheetName: SheetName, id: string): Promise<boolean> {
  const result = await update(sheetName, SHEET_HEADERS[sheetName] as unknown as z.ZodSchema, id, { isActive: "false" });
  return result !== null;
}
