import { NextRequest, NextResponse } from "next/server";

export interface ExtractedProduct {
  name: string;
  brand: string;
  price: number;
  category: string;
  sku: string;
  notes: string;
}

export interface PriceListExtraction {
  company: string;
  category: string;
  products: ExtractedProduct[];
  totalFound: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { image: string; mediaType?: string };
    const { image, mediaType = "image/jpeg" } = body;
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Demo mode — show sample extracted data so feature is visible without API key
      return NextResponse.json({
        company: "MADHURAM / BABA SHYAM",
        category: "Sarees",
        products: [
          { name: "AIRPORT", brand: "MADHURAM / BABA SHYAM", price: 480, category: "Sarees", sku: "", notes: "" },
          { name: "AK-47", brand: "MADHURAM / BABA SHYAM", price: 620, category: "Sarees", sku: "", notes: "" },
          { name: "AVTAR", brand: "MADHURAM / BABA SHYAM", price: 650, category: "Sarees", sku: "", notes: "" },
          { name: "BABY", brand: "MADHURAM / BABA SHYAM", price: 660, category: "Sarees", sku: "", notes: "" },
          { name: "BASANT", brand: "MADHURAM / BABA SHYAM", price: 675, category: "Sarees", sku: "", notes: "" },
        ],
        totalFound: 5,
        error: "ANTHROPIC_API_KEY not configured \u2014 showing demo extract. Add key in Vercel \u2192 Settings \u2192 Environment Variables for real extraction.",
      } as PriceListExtraction);
    }

    const prompt = `You are a data extraction assistant for an Indian ethnic wear shop called Aditya Textile in Gaya, Bihar.

This image is a PRICE LIST or CATALOG PAGE from a textile supplier/company.

Extract ALL products from this price list. Look for:
1. The company/supplier name (usually at the top as a heading)
2. The product category (Sarees, Kurtis, Lehengas, etc)
3. Every row: product name and its price in rupees

Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "company": "exact company/supplier name from heading",
  "category": "product category (Sarees/Kurtis/Lehengas/Salwar Suits/Kids Wear/Dupattas/etc)",
  "products": [
    {
      "name": "EXACT product name as written in the list",
      "brand": "same as company name",
      "price": 999,
      "category": "same category for all rows",
      "sku": "",
      "notes": ""
    }
  ],
  "totalFound": 51
}

RULES:
- Extract EVERY single row without skipping any
- Keep product names EXACTLY as written (ALL CAPS is fine, keep as-is)
- Price must be a plain number only, no \u20b9 symbol, no commas (90,700 becomes 90700)
- If serial numbers / row numbers appear, ignore them
- Set totalFound to the actual count of products array`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 8000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data: image } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", response.status, err);
      return NextResponse.json({ error: `AI extraction failed (${response.status})` }, { status: 500 });
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content.find((c) => c.type === "text")?.text ?? "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });

    const result = JSON.parse(match[0]) as PriceListExtraction;
    result.totalFound = result.products?.length ?? 0;
    return NextResponse.json(result);

  } catch (err) {
    console.error("Price list extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
