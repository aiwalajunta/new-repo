import { FESTIVALS } from "@/lib/constants";
import type { Festival } from "@/types";

const FESTIVALS_MAP = {
  diwali: { name: "Diwali", nameHi: "दिवाली", months: [10, 11], color: "#FF9933" },
  eid: { name: "Eid", nameHi: "ईद", months: [3, 4, 6, 7], color: "#006400" },
  wedding_season: { name: "Wedding Season", nameHi: "शादी का मौसम", months: [11, 12, 1, 2], color: "#B8860B" },
  navratri: { name: "Navratri", nameHi: "नवरात्रि", months: [3, 4, 9, 10], color: "#FF4500" },
  holi: { name: "Holi", nameHi: "होली", months: [3], color: "#FF69B4" },
  dussehra: { name: "Dussehra", nameHi: "दशहरा", months: [10], color: "#FF6347" },
} as const;

export function getCurrentFestival(): { key: string; name: string; nameHi: string; color: string } | null {
  const currentMonth = new Date().getMonth() + 1;
  for (const [key, festival] of Object.entries(FESTIVALS_MAP)) {
    if ((festival.months as readonly number[]).includes(currentMonth)) {
      return { key, name: festival.name, nameHi: festival.nameHi, color: festival.color };
    }
  }
  return null;
}

export function getFestiveGreeting(lang: "en" | "hi" = "en"): string {
  const festival = getCurrentFestival();
  if (!festival) return lang === "en" ? "Welcome to Aditya Textile" : "आदित्य टेक्सटाइल में आपका स्वागत है";
  const greetings: Record<string, { en: string; hi: string }> = {
    diwali: { en: "Light up your Diwali look!", hi: "दिवाली की चमक बढ़ाएं!" },
    eid: { en: "Celebrate Eid in elegance", hi: "ईद को शान से मनाएं" },
    wedding_season: { en: "Wedding season is here!", hi: "शादी का मौसम आ गया!" },
    navratri: { en: "Dance in color this Navratri!", hi: "नवरात्रि पर रंगों में झूमें!" },
    holi: { en: "Play Holi in style!", hi: "होली को स्टाइल में मनाएं!" },
  };
  const greeting = greetings[festival.key];
  return greeting ? greeting[lang] : (lang === "en" ? "Celebrate in style!" : "शान से मनाएं!");
}
