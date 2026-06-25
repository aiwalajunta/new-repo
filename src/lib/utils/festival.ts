import { FESTIVALS } from "@/lib/constants";
import type { Festival } from "@/types";

type FestivalKey = keyof typeof FESTIVALS;

export function getCurrentFestival(): { key: Festival; name: string; nameHi: string; color: string } | null {
  const currentMonth = new Date().getMonth() + 1;
  for (const key of Object.keys(FESTIVALS) as FestivalKey[]) {
    const festival = FESTIVALS[key];
    if ((festival.months as readonly number[]).includes(currentMonth)) {
      return { key: key as Festival, name: festival.name, nameHi: festival.nameHi, color: festival.color };
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
    christmas: { en: "Festive elegance for Christmas", hi: "क्रिसमस की शान" },
    pongal: { en: "Pongal celebrations await!", hi: "पोंगल का जश्न!" },
    onam: { en: "Onam — Celebrate in grace", hi: "ओणम — शान से मनाएं" },
    raksha_bandhan: { en: "Dress up for Raksha Bandhan!", hi: "रक्षा बंधन पर सजें!" },
    karwa_chauth: { en: "Look stunning this Karwa Chauth", hi: "करवा चौथ पर दमकें" },
  };
  const greeting = greetings[festival.key];
  if (!greeting) return lang === "en" ? "Celebrate in style!" : "शान से मनाएं!";
  return greeting[lang];
}
