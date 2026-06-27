import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, currentForm } = await req.json() as { image: string; currentForm: Record<string, unknown> };
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ confidence: "(Set ANTHROPIC_API_KEY in Vercel env to enable AI scan)" });
    }

    const prompt = `You are a textile product cataloging assistant for an Indian ethnic wear shop called Aditya Textile in Gaya, Bihar.
Analyze this product photo and extract ALL visible product details. Return ONLY valid JSON, no markdown.

Extract these fields (use empty string or empty array if not clearly visible):
{
  "name": "descriptive product name based on what you see (e.g. Banarasi Silk Saree - Red Gold Zari)",
  "brand": "brand name if visible on label/tag, else empty string",
  "fabric": "one of: Pure Silk/Cotton/Chanderi Silk/Banarasi Silk/Kanjivaram Silk/Georgette/Chiffon/Net/Velvet/Crepe/Linen/Satin/Tussar/Organza",
  "colors": ["primary color", "secondary color if any"],
  "pattern": "pattern/work type (Zari Work/Embroidery/Block Print/Plain/Bandhani/Sequence/Ikkat/Kalamkari)",
  "description": "2 sentence product description",
  "occasions": ["Wedding", "Festive", "Casual", "Party", "Daily", "Bridal", "Navratri"],
  "sizes": [],
  "confidence": "High/Medium/Low"
}

Context (current form data, do not override fields that already have values): ${JSON.stringify(currentForm)}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    if (!res.ok) {
      console.error("Claude API error:", res.status);
      return NextResponse.json({ confidence: "(AI scan failed - check API key)" });
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content.find((c) => c.type === "text")?.text ?? "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ confidence: "(Could not parse response)" });

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("AI scan error:", err);
    return NextResponse.json({ confidence: "(AI scan error)" });
  }
}
