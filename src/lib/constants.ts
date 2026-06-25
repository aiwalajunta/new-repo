export const APP_CONFIG = {
  name: "Aditya Textile",
  tagline: "Art of Ethnic",
  description: "Premium ethnic clothing — Sarees, Lehengas, Kurtis & more",
  url: "https://adityatextile.vercel.app",
  locale: "en-IN",
} as const;

export const BRAND_COLORS = {
  wine: "#6B1D3A", wineLight: "#8A2E50", wineDark: "#4E1229",
  gold: "#C8963B", goldLight: "#D4A94F", goldMuted: "#B8892F",
  ivory: "#FDF8F0", cream: "#F5EDE3", rose: "#F5E6EC",
  emerald: "#1A5E4B", emeraldLight: "#E8F5F0",
  text: "#1C1017", textMuted: "#6B5A61", textLight: "#9B8A91",
} as const;

export const CATEGORIES = [
  { slug: "sarees", name: "Sarees", nameHi: "साड़ियाँ", icon: "🥻" },
  { slug: "lehengas", name: "Lehengas", nameHi: "लहंगे", icon: "👗" },
  { slug: "kids-wear", name: "Kids Wear", nameHi: "बच्चों के कपड़े", icon: "👶" },
  { slug: "salwar-suits", name: "Salwar Suits", nameHi: "सलवार सूट", icon: "👘" },
  { slug: "kurtis", name: "Kurtis", nameHi: "कुर्तियाँ", icon: "👚" },
  { slug: "dupattas", name: "Dupattas", nameHi: "दुपट्टे", icon: "🧣" },
  { slug: "festive", name: "Festive Collection", nameHi: "त्योहार संग्रह", icon: "✨" },
] as const;

export const FESTIVALS = {
  diwali: { name: "Diwali", nameHi: "दिवाली", months: [10, 11], color: "#FF9933" },
  eid: { name: "Eid", nameHi: "ईद", months: [3, 4, 6, 7], color: "#006400" },
  wedding_season: { name: "Wedding Season", nameHi: "शादी का मौसम", months: [11, 12, 1, 2], color: "#B8860B" },
  pongal: { name: "Pongal", nameHi: "पोंगल", months: [1], color: "#FF6347" },
  onam: { name: "Onam", nameHi: "ओणम", months: [8, 9], color: "#FFD700" },
  christmas: { name: "Christmas", nameHi: "क्रिसमस", months: [12], color: "#C41E3A" },
  navratri: { name: "Navratri", nameHi: "नवरात्रि", months: [3, 4, 9, 10], color: "#FF4500" },
  holi: { name: "Holi", nameHi: "होली", months: [3], color: "#FF69B4" },
  raksha_bandhan: { name: "Raksha Bandhan", nameHi: "रक्षा बंधन", months: [8], color: "#9370DB" },
  karwa_chauth: { name: "Karwa Chauth", nameHi: "करवा चौथ", months: [10], color: "#DC143C" },
} as const;

export const LOYALTY = { pointsPerHundredRupees: 1, minRedeemablePoints: 100, pointValueInRupees: 1 } as const;
export const RESERVATION = {
  maxDaysInAdvance: 14, expiryHours: 48,
  timeSlots: ["10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"],
} as const;
export const STOCK_THRESHOLDS = { low: 3, out: 0 } as const;
export const NAV_ITEMS = [
  { href: "/", label: "Home", labelHi: "होम", icon: "Home" },
  { href: "/categories", label: "Categories", labelHi: "श्रेणियाँ", icon: "Grid3x3" },
  { href: "/wishlist", label: "Wishlist", labelHi: "पसंद", icon: "Heart" },
  { href: "/reservations", label: "Reservations", labelHi: "आरक्षण", icon: "CalendarCheck" },
  { href: "/profile", label: "Profile", labelHi: "प्रोफ़ाइल", icon: "User" },
] as const;
