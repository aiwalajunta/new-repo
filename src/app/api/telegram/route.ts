import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/lib/sheets/schemas";
import {
  sendMessage, editMessage, answerCallback,
  searchProducts, parsePriceRange,
  formatProduct, formatProductCompact,
  productButtons, paginationButtons, importButtons,
  type TelegramUpdate, type TelegramMessage,
} from "@/lib/telegram/bot";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const PAGE_SIZE = 5;

async function getProducts(baseUrl: string): Promise<Product[]> {
  try {
    const res = await fetch(`${baseUrl}/api/catalog`, { cache: "no-store" });
    const data = await res.json() as { products: Product[] };
    return data.products ?? [];
  } catch { return []; }
}

async function understandQuery(text: string): Promise<{
  type: "search" | "price_range" | "stock_alert" | "list" | "help" | "unknown";
  query?: string; min?: number; max?: number;
}> {
  if (!ANTHROPIC_KEY) {
    const t = text.toLowerCase();
    if (t.match(/help|kya|what|how/)) return { type: "help" };
    if (t.match(/low stock|khatam|stock kam|out of stock/)) return { type: "stock_alert" };
    if (t.match(/list|sab|all|dikha/)) return { type: "list" };
    const range = parsePriceRange(t);
    if (range) return { type: "price_range", ...range };
    return { type: "search", query: text.trim() };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: `Classify this message from Indian textile shop staff. Return JSON only.\nMessage: "${text}"\n\nReturn ONE:\n{"type":"search","query":"product name"}\n{"type":"price_range","min":0,"max":500}\n{"type":"stock_alert"}\n{"type":"list"}\n{"type":"help"}\n\nHindi/Hinglish ok. "AIRPORT ka daam" = search AIRPORT. Return ONLY the JSON.` }],
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const raw = data.content.find(c => c.type === "text")?.text ?? "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error();
    return JSON.parse(match[0]);
  } catch {
    const range = parsePriceRange(text);
    if (range) return { type: "price_range", ...range };
    return { type: "search", query: text.trim() };
  }
}

async function handleDocument(msg: TelegramMessage, _baseUrl: string) {
  const doc = msg.document!;
  const chatId = msg.chat.id;
  if (!doc.file_name?.match(/\.(xlsx|csv|xls)$/i)) return;

  await sendMessage(chatId, "\uD83D\uDCCB <b>Price List Detected!</b>\n\n\u23F3 Reading file...");
  try {
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${doc.file_id}`);
    const fileData = await fileRes.json() as { ok: boolean; result: { file_path: string } };
    if (!fileData.ok) throw new Error();
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    const fileContent = await fetch(fileUrl);
    const buffer = await fileContent.arrayBuffer();
    const XLSX = await import("xlsx");
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    let company = "Unknown Company";
    const firstRow = rows[0] ?? {};
    const firstVals = Object.values(firstRow).filter(v => v && String(v).trim());
    if (firstVals.length > 0) company = String(firstVals[0]).trim();
    const preview = rows.slice(0, 3).map((row, i) => {
      const name = Object.values(row).find(v => v && isNaN(Number(v))) ?? `Item ${i + 1}`;
      const price = Object.values(row).find(v => v && !isNaN(Number(v)) && Number(v) > 100);
      return `  ${i + 1}. ${name}${price ? ` \u2014 \u20B9${Number(price).toLocaleString("en-IN")}` : ""}`;
    }).join("\n");
    await sendMessage(chatId, [
      `\uD83D\uDCCB <b>${doc.file_name}</b>`,
      `\uD83C\UDFE2 Company: <b>${company}</b>`,
      `\uD83D\uDCE6 ~${rows.length} products found`,
      "",
      "\uD83D\uDCDD Preview:",
      preview,
      "  ...",
      "",
      "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501",
      "\u26A0\uFE0F <b>Existing catalog will NOT be changed.</b>",
      "What would you like to do?",
    ].join("\n"), { reply_markup: importButtons(doc.file_id, company, rows.length) });
  } catch {
    await sendMessage(chatId, "\u274C Could not read this file. Make sure it\'s a valid .xlsx or .csv");
  }
}

async function handleMessage(msg: TelegramMessage, baseUrl: string) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  if (msg.document) { await handleDocument(msg, baseUrl); return; }
  if (!text) return;

  if (text === "/start" || text === "/help") {
    await sendMessage(chatId, [
      "\uD83D\uDC4B <b>Aditya Textile Price Bot</b>",
      "\uD83D\uDED9 Art of Ethnic \u2014 Gaya, Bihar",
      "",
      "Just type to search! Examples:",
      "",
      "\uD83D\uDD0D <code>AIRPORT</code> \u2192 price + stock + rack",
      "\uD83D\uDD0D <code>air</code> \u2192 all matches starting with air",
      "\uD83D\uDCB0 <code>under 500</code> \u2192 products below \u20B9500",
      "\uD83D\uDCB0 <code>400 to 600</code> \u2192 price range",
      "\uD83D\uDCB0 <code>500 se kam</code> \u2192 Hindi works too!",
      "\uD83D\uDCE6 <code>low stock</code> \u2192 items running out",
      "\uD83D\uDCE6 <code>khatam</code> \u2192 out of stock items",
      "\uD83D\uDCCB <code>/list</code> \u2192 all products",
      "\uD83C\UDFE2 <code>/companies</code> \u2192 all suppliers",
      "",
      "\uD83D\uDCE4 Share an Excel file \u2192 bot asks before importing",
      "\u2728 Hindi + English both work!",
    ].join("\n"));
    return;
  }

  if (text === "/list") {
    const products = await getProducts(baseUrl);
    if (!products.length) { await sendMessage(chatId, "\u274C No products in catalog yet."); return; }
    const page = products.slice(0, PAGE_SIZE);
    await sendMessage(chatId,
      `\uD83D\uDCE6 <b>Products (1-${Math.min(PAGE_SIZE, products.length)} of ${products.length})</b>\n\n${page.map(formatProductCompact).join("\n")}`,
      { reply_markup: paginationButtons("__list__", 0, products.length, PAGE_SIZE) }
    );
    return;
  }

  if (text === "/companies") {
    const products = await getProducts(baseUrl);
    const companies = [...new Set(products.map(p => p.brand).filter(Boolean))];
    if (!companies.length) { await sendMessage(chatId, "\u274C No companies found."); return; }
    await sendMessage(chatId, `\uD83C\UDFE2 <b>Companies (${companies.length})</b>\n\n${companies.map((c, i) => `${i + 1}. ${c}`).join("\n")}`);
    return;
  }

  const intent = await understandQuery(text);
  if (intent.type === "help") {
    await sendMessage(chatId, "Type any product name! Try: <code>AIRPORT</code> or <code>under 500</code>");
    return;
  }

  const products = await getProducts(baseUrl);

  if (intent.type === "stock_alert") {
    const low = products.filter(p => p.stockAvailable > 0 && p.stockAvailable <= 5);
    const out = products.filter(p => p.stockAvailable === 0);
    if (!low.length && !out.length) { await sendMessage(chatId, "\u2705 All products have good stock!"); return; }
    const lines = [out.length ? `\uD83D\uDD34 <b>Out of Stock (${out.length})</b>\n${out.map(p => `\u2022 ${p.name}`).join("\n")}` : "", low.length ? `\uD83D\UDFE1 <b>Low Stock (${low.length})</b>\n${low.map(p => `\u2022 ${p.name} \u2014 ${p.stockAvailable} left`).join("\n")}` : ""].filter(Boolean).join("\n\n");
    await sendMessage(chatId, `\uD83D\uDCCA <b>Stock Alert</b>\n\n${lines}`);
    return;
  }

  if (intent.type === "price_range") {
    const { min = 0, max = 999999 } = intent;
    const filtered = products.filter(p => p.finalPrice >= min && p.finalPrice <= max).sort((a, b) => a.finalPrice - b.finalPrice);
    if (!filtered.length) { await sendMessage(chatId, `\u274C No products found in that price range.`); return; }
    const page = filtered.slice(0, PAGE_SIZE);
    const rangeText = max === 999999 ? `above \u20B9${min.toLocaleString("en-IN")}` : `\u20B9${min.toLocaleString("en-IN")}\u2013\u20B9${max.toLocaleString("en-IN")}`;
    await sendMessage(chatId,
      `\uD83D\uDCB0 <b>Products ${rangeText} (${filtered.length} found)</b>\n\n${page.map(formatProductCompact).join("\n")}`,
      filtered.length > PAGE_SIZE ? { reply_markup: paginationButtons(`__range__${min}__${max}`, 0, filtered.length) } : {}
    );
    return;
  }

  const query = intent.query ?? text;
  const results = searchProducts(query, products, 20);
  if (!results.length) {
    const suggestions = searchProducts(query.slice(0, 3), products, 3);
    let reply = `\u274C No product found for "<b>${query}</b>"`;
    if (suggestions.length) reply += `\n\nDid you mean?\n${suggestions.map(p => `\u2022 ${formatProductCompact(p)}`).join("\n")}`;
    await sendMessage(chatId, reply);
    return;
  }
  if (results.length === 1) {
    await sendMessage(chatId, formatProduct(results[0]), { reply_markup: productButtons(results[0].id) });
    return;
  }
  const page = results.slice(0, PAGE_SIZE);
  await sendMessage(chatId,
    `\uD83D\uDD0D <b>${results.length} results for "${query}"</b>\n\n${page.map(formatProductCompact).join("\n")}\n\n\uD83D\uDCA1 <i>Type exact name for full details</i>`,
    results.length > PAGE_SIZE ? { reply_markup: paginationButtons(query, 0, results.length) } : {}
  );
}

async function handleCallback(query: NonNullable<TelegramUpdate["callback_query"]>, baseUrl: string) {
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;
  const data = query.data;
  await answerCallback(query.id);
  if (data === "noop" || data === "import:skip") {
    if (data === "import:skip") await editMessage(chatId, msgId, "\u23ED\uFE0F Skipped. Catalog unchanged.");
    return;
  }
  if (data.startsWith("page:")) {
    const parts = data.split(":"); const rawQuery = parts[1]; const page = parseInt(parts[2]);
    const products = await getProducts(baseUrl);
    let filtered: Product[]; let title: string;
    if (rawQuery === "__list__") { filtered = products; title = "Products"; }
    else if (rawQuery.startsWith("__range__")) { const [,,min,max] = rawQuery.split("__"); filtered = products.filter(p => p.finalPrice >= Number(min) && p.finalPrice <= Number(max)).sort((a,b) => a.finalPrice-b.finalPrice); title = "Price Range"; }
    else { filtered = searchProducts(rawQuery, products, 50); title = `Results for "${rawQuery}"`; }
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    await editMessage(chatId, msgId, `\uD83D\uDCE6 <b>${title} (${page*PAGE_SIZE+1}\u2013${Math.min((page+1)*PAGE_SIZE,filtered.length)} of ${filtered.length})</b>\n\n${pageItems.map(formatProductCompact).join("\n")}`, { reply_markup: paginationButtons(rawQuery, page, filtered.length) });
    return;
  }
  if (data.startsWith("stock:")) {
    const productId = data.replace("stock:", "");
    const products = await getProducts(baseUrl);
    const p = products.find(x => x.id === productId);
    if (!p) { await sendMessage(chatId, "Product not found."); return; }
    const s = p.stockAvailable === 0 ? "\uD83D\uDD34 <b>Out of Stock</b>" : p.stockAvailable <= 5 ? `\uD83D\UDFE1 <b>Low: ${p.stockAvailable} left</b>` : `\uD83D\UDFE2 <b>${p.stockAvailable} available</b>`;
    await sendMessage(chatId, `\uD83D\uDCE6 <b>${p.name}</b>\n\n${s}\nTotal: ${p.stockTotal} \u00B7 Reserved: ${p.stockReserved}${p.rackLocation ? `\n\uD83D\UDCCD Rack: ${p.rackLocation}` : ""}`);
    return;
  }
  if (data.startsWith("book:")) {
    await sendMessage(chatId, "\uD83D\uDCC5 To book a visit, open the Aditya Textile app:\nDashboard \u2192 Appointments \u2192 New Appointment");
    return;
  }
  if (data.startsWith("import:new:") || data.startsWith("import:preview:")) {
    await sendMessage(chatId, "\uD83D\uDCF1 Open the Aditya Textile app to complete import:\nProducts \u2192 \uD83D\uDCF8 Scan Price List or \uD83D\uDCE5 Import Excel");
    return;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!BOT_TOKEN) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
    const update = await req.json() as TelegramUpdate;
    const baseUrl = `https://${req.headers.get("host")}`;
    if (update.callback_query) await handleCallback(update.callback_query, baseUrl);
    else if (update.message) await handleMessage(update.message, baseUrl);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: !!BOT_TOKEN, ai: !!process.env.ANTHROPIC_API_KEY, message: BOT_TOKEN ? "Webhook active" : "TELEGRAM_BOT_TOKEN not set" });
}
