/**
 * Mock data used when Google Sheets env vars are not configured.
 * Lets the app build & run so you can see the UI before sheets are ready.
 */
import type { Product, Category } from "./schemas";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_001", name: "Sarees", slug: "sarees", parentId: "", displayOrder: 1, iconUrl: "", isActive: true },
  { id: "cat_002", name: "Lehengas", slug: "lehengas", parentId: "", displayOrder: 2, iconUrl: "", isActive: true },
  { id: "cat_003", name: "Kids Wear", slug: "kids-wear", parentId: "", displayOrder: 3, iconUrl: "", isActive: true },
  { id: "cat_004", name: "Salwar Suits", slug: "salwar-suits", parentId: "", displayOrder: 4, iconUrl: "", isActive: true },
  { id: "cat_005", name: "Kurtis", slug: "kurtis", parentId: "", displayOrder: 5, iconUrl: "", isActive: true },
  { id: "cat_006", name: "Dupattas", slug: "dupattas", parentId: "", displayOrder: 6, iconUrl: "", isActive: true },
  { id: "cat_007", name: "Festive Collection", slug: "festive", parentId: "", displayOrder: 7, iconUrl: "", isActive: true },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "prod_001", title: "Banarasi Silk Saree", slug: "banarasi-silk-saree", categoryId: "cat_001", description: "Elegant handwoven Banarasi silk saree with gold zari work. Perfect for weddings and festive occasions.", fabric: "Silk", occasion: ["Wedding", "Festive"], basePrice: 12999, discountPct: 10, finalPrice: 11699, tags: ["silk", "banarasi", "wedding", "gold"], isNewArrival: true, isTrending: true, isActive: true, createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" },
  { id: "prod_002", title: "Anarkali Suit Set", slug: "anarkali-suit-set", categoryId: "cat_004", description: "Floor-length Anarkali with dupatta in royal blue georgette. Ideal for parties.", fabric: "Georgette", occasion: ["Party", "Festive"], basePrice: 5999, discountPct: 15, finalPrice: 5099, tags: ["anarkali", "party", "blue"], isNewArrival: true, isTrending: false, isActive: true, createdAt: "2024-01-16T10:00:00Z", updatedAt: "2024-01-16T10:00:00Z" },
  { id: "prod_003", title: "Lehenga Choli Set", slug: "lehenga-choli-set", categoryId: "cat_002", description: "Stunning bridal lehenga in deep crimson with intricate embroidery.", fabric: "Velvet", occasion: ["Wedding", "Bridal"], basePrice: 24999, discountPct: 5, finalPrice: 23749, tags: ["lehenga", "bridal", "crimson", "embroidery"], isNewArrival: false, isTrending: true, isActive: true, createdAt: "2024-01-17T10:00:00Z", updatedAt: "2024-01-17T10:00:00Z" },
  { id: "prod_004", title: "Cotton Kurti", slug: "cotton-kurti", categoryId: "cat_005", description: "Comfortable everyday cotton kurti with block print design.", fabric: "Cotton", occasion: ["Casual", "Daily"], basePrice: 1299, discountPct: 0, finalPrice: 1299, tags: ["kurti", "cotton", "casual", "blockprint"], isNewArrival: true, isTrending: false, isActive: true, createdAt: "2024-01-18T10:00:00Z", updatedAt: "2024-01-18T10:00:00Z" },
  { id: "prod_005", title: "Kids Ghagra Set", slug: "kids-ghagra-set", categoryId: "cat_003", description: "Adorable ghagra choli for little girls. Perfect for festivals.", fabric: "Net", occasion: ["Festive", "Kids"], basePrice: 2499, discountPct: 20, finalPrice: 1999, tags: ["kids", "ghagra", "festival"], isNewArrival: false, isTrending: true, isActive: true, createdAt: "2024-01-19T10:00:00Z", updatedAt: "2024-01-19T10:00:00Z" },
  { id: "prod_006", title: "Chiffon Dupatta", slug: "chiffon-dupatta", categoryId: "cat_006", description: "Light chiffon dupatta with hand-painted floral motifs.", fabric: "Chiffon", occasion: ["Casual", "Festive"], basePrice: 899, discountPct: 10, finalPrice: 809, tags: ["dupatta", "chiffon", "floral"], isNewArrival: true, isTrending: false, isActive: true, createdAt: "2024-01-20T10:00:00Z", updatedAt: "2024-01-20T10:00:00Z" },
];

export const SHEETS_AVAILABLE = !!(
  process.env.GOOGLE_SPREADSHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY
);
