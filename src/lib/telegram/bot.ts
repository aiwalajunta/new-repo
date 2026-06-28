import type { Product } from "@/lib/sheets/schemas";

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: { id: number; type: string; title?: string };
  text?: string;
  document?: { file_id: string; file_name: string; mime_type: string };
  photo?: Array<{ file_id: string }>;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message: TelegramMessage;
  data: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string, extra?: Record<string, unknown>) {
  await fetch(`${BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
  });
}

export async function editMessage(chatId: number, messageId: number, text: string, extra?: Record<string, unknown>) {
  await fetch(`${BASE}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", ...extra }),
  });
}

export async function answerCallback(callbackId: string, text?: string) {
  await fetch(`${BASE}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text: text ?? "", show_alert: false }),
  });
}

export function searchProducts(query: string, products: Product[], limit = 5): Product[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const exact = products.filter(p => p.name.toLowerCase() === q);
  if (exact.length > 0) return exact.slice(0, limit);
  const starts = products.filter(p => p.name.toLowerCase().startsWith(q));
  const contains = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.brand ?? "").toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.colors.some(c => c.toLowerCase().includes(q))
  );
  const fuzzy = products.filter(p => {
    const name = p.name.toLowerCase();
    let qi = 0;
    for (const ch of name) {
      if (ch === q[qi]) qi++;
      if (qi === q.length) return true;
    }
    return false;
  });
  const seen = new Set<string>();
  const results: Product[] = [];
  for (const p of [...starts, ...contains, ...fuzzy]) {
    if (!seen.has(p.id)) { seen.add(p.id); results.push(p); }
    if (results.length >= limit) break;
  }
  return results;
}

export function parsePriceRange(text: string): { min: number; max: number } | null {
  const under = text.match(/(?:under|below|se kam|less than)[\s₹]*(\d+)/i);
  if (under) return { min: 0, max: parseInt(under[1]) };
  const above = text.match(/(?:above|over|se zyada|more than)[\s₹]*(\d+)/i);
  if (above) return { min: parseInt(above[1]), max: 999999 };
  const range = text.match(/(\d+)\s*(?:to|-|se)\s*(\d+)/i);
  if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) };
  return null;
}

export function formatProduct(p: Product, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : "";
  const stock = p.stockAvailable === 0 ? "\uD83D\uDD34 Out of Stock"
    : p.stockAvailable <= 5 ? `\uD83D\UDFE1 Only ${p.stockAvailable} left`
    : `\uD83D\UDFE2 ${p.stockAvailable} in stock`;
  const rack = p.rackLocation ? `\n\uD83D\UDCCD Rack: <b>${p.rackLocation}</b>` : "";
  const discount = p.discountPct > 0 ? ` <s>\u20B9${p.sellingPrice.toLocaleString("en-IN")}</s> \uD83C\UDFF7\uFE0F ${p.discountPct}% off` : "";
  return `${prefix}\u2728 <b>${p.name}</b>\n\uD83D\uDCB0 <b>\u20B9${p.finalPrice.toLocaleString("en-IN")}</b>${discount}\n\uD83C\UDFE2 ${p.brand ?? "Aditya Textile"} \u00B7 ${p.fabric ?? ""}${rack}\n${stock}`;
}

export function formatProductCompact(p: Product): string {
  const stock = p.stockAvailable === 0 ? "\uD83D\uDD34" : p.stockAvailable <= 5 ? "\uD83D\UDFE1" : "\uD83D\UDFE2";
  return `${stock} <b>${p.name}</b> \u2014 \u20B9${p.finalPrice.toLocaleString("en-IN")}${p.rackLocation ? ` \u00B7 \uD83D\UDCCD${p.rackLocation}` : ""}`;
}

export function productButtons(productId: string) {
  return { inline_keyboard: [[{ text: "\uD83D\uDCE6 Check Stock", callback_data: `stock:${productId}` }, { text: "\uD83D\uDCC5 Book Visit", callback_data: `book:${productId}` }]] };
}

export function paginationButtons(query: string, page: number, total: number, pageSize = 5) {
  const buttons = [];
  if (page > 0) buttons.push({ text: "\u2B05\uFE0F Prev", callback_data: `page:${query}:${page - 1}` });
  buttons.push({ text: `${page + 1}/${Math.ceil(total / pageSize)}`, callback_data: "noop" });
  if ((page + 1) * pageSize < total) buttons.push({ text: "Next \u27A1\uFE0F", callback_data: `page:${query}:${page + 1}` });
  return { inline_keyboard: [buttons] };
}

export function importButtons(fileId: string, _company: string, _count: number) {
  return {
    inline_keyboard: [
      [{ text: "\uD83D\uDCE5 Add as NEW list", callback_data: `import:new:${fileId}` }, { text: "\uD83D\uDC40 Preview first", callback_data: `import:preview:${fileId}` }],
      [{ text: "\u23ED\uFE0F Skip this file", callback_data: "import:skip" }],
    ],
  };
}
