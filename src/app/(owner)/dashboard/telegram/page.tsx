"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Copy, ExternalLink, Bot, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/product-store";

function Step({ num, title, done, children }: { num: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-green-500 text-white" : "bg-brand-wine text-white"}`}>
        {done ? "\u2713" : num}
      </div>
      <div className="flex-1 pb-6">
        <p className="font-semibold text-gray-900 mb-2">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function TelegramSetupPage() {
  const { products } = useProductStore();
  const [botStatus, setBotStatus] = useState<"idle"|"checking"|"ok"|"error">("idle");
  const [syncStatus, setSyncStatus] = useState<"idle"|"syncing"|"done"|"error">("idle");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => { setWebhookUrl(`${window.location.origin}/api/telegram`); }, []);

  const checkBot = async () => {
    setBotStatus("checking");
    try {
      const res = await fetch("/api/telegram");
      const data = await res.json() as { ok: boolean; bot: boolean };
      setBotStatus(data.bot ? "ok" : "error");
      toast({ title: data.bot ? "\u2705 Bot is configured correctly" : "\u274C TELEGRAM_BOT_TOKEN not set in Vercel", variant: data.bot ? "success" : "error" });
    } catch { setBotStatus("error"); }
  };

  const syncCatalog = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-catalog-secret": "aditya-textile-nextauth-secret-2024-fallback" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json() as { success: boolean; synced: number };
      setSyncStatus(data.success ? "done" : "error");
      toast({ title: data.success ? `\u2713 ${data.synced} products synced to bot` : "Sync failed", variant: data.success ? "success" : "error" });
    } catch { setSyncStatus("error"); toast({ title: "Sync failed", variant: "error" }); }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label); setTimeout(() => setCopied(""), 2000);
    toast({ title: "Copied!", variant: "success" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot size={24} className="text-[#0088CC]" /> Telegram Bot Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">One-time setup. Bot joins your existing staff group and answers price queries automatically.</p>
      </div>

      <Card className="border-[#0088CC]/30 bg-[#0088CC]/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">\uD83E\uDD16</span>
            <div>
              <p className="font-semibold text-gray-900">Bot Status</p>
              <p className="text-xs text-gray-500">{botStatus === "ok" ? "\u2705 Connected and ready" : botStatus === "error" ? "\u274C Token not configured" : "Check if your bot token is set"}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={checkBot} disabled={botStatus === "checking"} className="gap-2">
            <RefreshCw size={14} className={botStatus === "checking" ? "animate-spin" : ""} /> Check Status
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

        <Step num={1} title="Create your Telegram Bot (free, 2 minutes)">
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>1. Open Telegram \u2192 search <code className="bg-gray-100 px-1 rounded">@BotFather</code></p>
            <p>2. Send <code className="bg-gray-100 px-1 rounded">/newbot</code></p>
            <p>3. Name: <code className="bg-gray-100 px-1 rounded">Aditya Textile Price Bot</code></p>
            <p>4. BotFather gives you a token like: <code className="bg-gray-100 px-1 rounded text-xs">7123456789:AAFxyz...</code></p>
          </div>
          <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="mt-3 gap-2 text-[#0088CC] border-[#0088CC]/30">
              <ExternalLink size={13} /> Open @BotFather on Telegram
            </Button>
          </a>
        </Step>

        <Step num={2} title="Add TELEGRAM_BOT_TOKEN to Vercel">
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>1. Vercel \u2192 Project \u2192 Settings \u2192 Environment Variables</p>
            <p>2. Add <code className="bg-gray-100 px-1 rounded">TELEGRAM_BOT_TOKEN</code> = your token from step 1</p>
            <p>3. Select: Production + Preview + Development \u2192 Save</p>
            <p>4. <strong>Redeploy</strong> the project (Deployments \u2192 Redeploy latest)</p>
          </div>
          <a href="https://vercel.com/aiwalajunta/new-repo/settings/environment-variables" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="mt-3 gap-2"><ExternalLink size={13} /> Open Vercel Env Settings</Button>
          </a>
        </Step>

        <Step num={3} title="Register webhook with Telegram (paste in browser)">
          <p className="text-sm text-gray-600 mb-2">Copy this URL, replace YOUR_TOKEN, and open in browser:</p>
          <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-green-400 break-all relative">
            {`https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=${webhookUrl}`}
            <button onClick={() => copy(`https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=${webhookUrl}`, "webhook")}
              className="absolute top-2 right-2 text-gray-500 hover:text-white">
              {copied === "webhook" ? <CheckCircle size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">You should see <code className="bg-gray-100 px-1 rounded">{`{"ok":true}`}</code> in browser \u2014 webhook is active!</p>
        </Step>

        <Step num={4} title="Add bot to your staff Telegram group">
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>1. Open your staff Telegram group</p>
            <p>2. Group Settings \u2192 Add Member \u2192 search your bot username</p>
            <p>3. Make it an <strong>Admin</strong> so it can read messages</p>
            <p>\u2705 Bot stays silent until someone asks for a price. Existing chat unchanged!</p>
          </div>
        </Step>

        <Step num={5} title="Sync your products to the bot">
          <p className="text-sm text-gray-600 mb-3">Push your {products.length} products to the bot. Do this whenever you add new products.</p>
          <Button onClick={syncCatalog} disabled={syncStatus === "syncing"} className="gap-2" style={{ background: "#0088CC" }}>
            {syncStatus === "syncing" ? <><RefreshCw size={15} className="animate-spin" /> Syncing...</>
              : syncStatus === "done" ? <><CheckCircle size={15} /> Synced! Sync again</>
              : <><Zap size={15} /> Sync {products.length} Products to Bot</>}
          </Button>
          <p className="text-xs text-gray-400 mt-2">Takes 2 seconds. Sync again after importing new price lists.</p>
        </Step>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot size={16} className="text-[#0088CC]"/> What the bot can do</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { e: "\uD83D\uDD0D", t: "Instant price lookup", d: "Type AIRPORT \u2192 bot replies \u20B9480 + stock + rack. Works in 1 second." },
            { e: "\u2728", t: "Fuzzy search + typeahead", d: "Type \"air\" \u2192 shows AIRPORT, AIRTEL... Handles typos like \"airprot\"" },
            { e: "\uD83D\uDCB0", t: "Price range search", d: "\"under 500\" or \"400 to 600\" or \"500 se kam\" \u2192 lists all matching products" },
            { e: "\uD83D\uDCE6", t: "Stock alerts", d: "\"low stock\" or \"khatam\" \u2192 shows items running out or out of stock" },
            { e: "\uD83D\uDDE3\uFE0F", t: "Hindi + English", d: "\"AIRPORT ka daam\" works exactly like \"AIRPORT price\"" },
            { e: "\uD83D\uDCCB", t: "Excel detection (with permission)", d: "Owner shares Excel \u2192 bot asks before importing. Never auto-updates. Existing catalog safe." },
            { e: "\uD83D\uDCF1", t: "Paginated results", d: "Multiple matches shown 5 at a time with Next/Prev buttons" },
          ].map(f => (
            <div key={f.t} className="flex gap-3">
              <span className="text-xl">{f.e}</span>
              <div><p className="text-sm font-semibold text-gray-900">{f.t}</p><p className="text-xs text-gray-500">{f.d}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#17212B] border-0">
        <CardHeader><CardTitle className="text-sm text-gray-400 font-normal">Preview \u2014 How it looks in your Telegram group</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { from: "Ravi (Staff)", text: "AIRPORT", right: false },
            { from: "\uD83E\uDD16 Price Bot", text: "\u2728 AIRPORT\n\uD83D\uDCB0 \u20B9480\n\uD83C\UDFE2 MADHURAM / BABA SHYAM \u00B7 Georgette\n\uD83D\uDCCD Rack: A-3\n\uD83D\uDFE2 5 in stock", right: true },
            { from: "Ravi (Staff)", text: "under 500", right: false },
            { from: "\uD83E\uDD16 Price Bot", text: "\uD83D\uDCB0 Products \u20B90\u2013\u20B9500 (8 found)\n\n\uD83D\uDFE2 AIRPORT \u2014 \u20B9480 \u00B7 \uD83D\uDCCDA-3\n\uD83D\uDFE2 GAZAL \u2014 \u20B9445 \u00B7 \uD83D\uDCCDB-1\n\uD83D\uDFE2 KASHI \u2014 \u20B9445 \u00B7 \uD83D\uDCCDB-2\n\uD83D\uDFE1 WELCOME \u2014 \u20B9385\n...\n[\u2B05\uFE0F Prev] [1/2] [Next \u27A1\uFE0F]", right: true },
            { from: "Ravi (Staff)", text: "airprot", right: false },
            { from: "\uD83E\uDD16 Price Bot", text: "\u274C No exact match for \"airprot\"\n\nDid you mean?\n\u2022 \uD83D\uDFE2 AIRPORT \u2014 \u20B9480 \u00B7 \uD83D\uDCCDA-3", right: true },
          ].map((msg, i) => (
            <div key={i} className={`flex ${msg.right ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${msg.right ? "bg-[#2B5278] text-white" : "bg-[#1E2C3A] text-gray-200"}`}>
                <p className={`text-[10px] mb-1 ${msg.right ? "text-blue-300" : "text-gray-400"}`}>{msg.from}</p>
                <pre className="font-sans text-xs whitespace-pre-wrap">{msg.text}</pre>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
