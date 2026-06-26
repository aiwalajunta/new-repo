import type { Product, Category, Customer, Appointment, AppointmentItem } from "./schemas";

export const SHEETS_AVAILABLE = !!(
  process.env.GOOGLE_SPREADSHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY
);

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_001", name: "Sarees", nameHi: "साड़ियाँ", slug: "sarees", parentId: "", displayOrder: 1, icon: "🥻", isActive: true },
  { id: "cat_002", name: "Bridal Sarees", nameHi: "ब्राइडल साड़ियाँ", slug: "bridal-sarees", parentId: "cat_001", displayOrder: 2, icon: "👰", isActive: true },
  { id: "cat_003", name: "Lehengas", nameHi: "लहंगे", slug: "lehengas", parentId: "", displayOrder: 3, icon: "👗", isActive: true },
  { id: "cat_004", name: "Kurtis", nameHi: "कुर्तियाँ", slug: "kurtis", parentId: "", displayOrder: 4, icon: "👚", isActive: true },
  { id: "cat_005", name: "Salwar Suits", nameHi: "सलवार सूट", slug: "salwar-suits", parentId: "", displayOrder: 5, icon: "👘", isActive: true },
  { id: "cat_006", name: "Kids Wear", nameHi: "बच्चों के कपड़े", slug: "kids-wear", parentId: "", displayOrder: 6, icon: "👶", isActive: true },
  { id: "cat_007", name: "Men's Wear", nameHi: "पुरुष वस्त्र", slug: "mens-wear", parentId: "", displayOrder: 7, icon: "👔", isActive: true },
  { id: "cat_008", name: "Dupattas", nameHi: "दुपट्टे", slug: "dupattas", parentId: "", displayOrder: 8, icon: "🧣", isActive: true },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "prod_001", name: "Banarasi Silk Saree - Gold Zari", sku: "SAR-BAN-001", barcode: "8901234567890", categoryId: "cat_001", brand: "Aditya Textile", fabric: "Pure Silk", colors: ["Red", "Gold"], pattern: "Zari Work", occasions: ["Wedding", "Festive"], sizes: ["Free Size"], purchasePrice: 8000, sellingPrice: 14999, discountPct: 10, finalPrice: 13499, stockTotal: 5, stockReserved: 1, stockAvailable: 4, imageUrls: [], description: "Handwoven Banarasi silk saree with intricate gold zari border and pallu.", notes: "Top seller for wedding season", rackLocation: "A-12", tags: ["silk", "banarasi", "wedding", "bestseller"], isActive: true, isFeatured: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "prod_002", name: "Chanderi Cotton Saree - Floral", sku: "SAR-CHN-002", barcode: "8901234567891", categoryId: "cat_001", brand: "Aditya Textile", fabric: "Chanderi Cotton", colors: ["Pink", "White"], pattern: "Floral Print", occasions: ["Casual", "Office"], sizes: ["Free Size"], purchasePrice: 1200, sellingPrice: 2499, discountPct: 0, finalPrice: 2499, stockTotal: 12, stockReserved: 0, stockAvailable: 12, imageUrls: [], description: "Lightweight Chanderi cotton saree perfect for daily wear.", notes: "", rackLocation: "B-05", tags: ["cotton", "chanderi", "casual"], isActive: true, isFeatured: false, createdAt: "2024-01-02T00:00:00Z", updatedAt: "2024-01-02T00:00:00Z" },
  { id: "prod_003", name: "Bridal Lehenga - Crimson Velvet", sku: "LEH-BRI-001", barcode: "8901234567892", categoryId: "cat_003", brand: "Aditya Textile", fabric: "Velvet", colors: ["Crimson", "Gold"], pattern: "Heavy Embroidery", occasions: ["Wedding", "Bridal"], sizes: ["S", "M", "L", "XL"], purchasePrice: 15000, sellingPrice: 34999, discountPct: 5, finalPrice: 33249, stockTotal: 3, stockReserved: 1, stockAvailable: 2, imageUrls: [], description: "Stunning bridal lehenga with hand-embroidered work and matching dupatta.", notes: "Available for alteration", rackLocation: "C-01", tags: ["bridal", "velvet", "embroidery", "premium"], isActive: true, isFeatured: true, createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-03T00:00:00Z" },
  { id: "prod_004", name: "Block Print Kurti - Indigo", sku: "KUR-BLK-001", barcode: "8901234567893", categoryId: "cat_004", brand: "Aditya Textile", fabric: "Cotton", colors: ["Indigo", "White"], pattern: "Block Print", occasions: ["Casual", "Daily"], sizes: ["S", "M", "L", "XL", "XXL"], purchasePrice: 400, sellingPrice: 899, discountPct: 0, finalPrice: 899, stockTotal: 25, stockReserved: 0, stockAvailable: 25, imageUrls: [], description: "Comfortable everyday cotton kurti with traditional block print.", notes: "Fast moving item", rackLocation: "D-08", tags: ["kurti", "cotton", "blockprint", "casual"], isActive: true, isFeatured: false, createdAt: "2024-01-04T00:00:00Z", updatedAt: "2024-01-04T00:00:00Z" },
  { id: "prod_005", name: "Kids Ghagra Set - Festival", sku: "KID-GHG-001", barcode: "8901234567894", categoryId: "cat_006", brand: "Aditya Textile", fabric: "Net + Inner Cotton", colors: ["Orange", "Pink"], pattern: "Embroidered", occasions: ["Festive", "Navratri"], sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], purchasePrice: 800, sellingPrice: 1999, discountPct: 10, finalPrice: 1799, stockTotal: 8, stockReserved: 2, stockAvailable: 6, imageUrls: [], description: "Adorable festival ghagra set for little girls.", notes: "Popular for Navratri", rackLocation: "E-03", tags: ["kids", "ghagra", "navratri", "festive"], isActive: true, isFeatured: true, createdAt: "2024-01-05T00:00:00Z", updatedAt: "2024-01-05T00:00:00Z" },
  { id: "prod_006", name: "Anarkali Salwar Suit - Royal Blue", sku: "SAL-ANK-001", barcode: "8901234567895", categoryId: "cat_005", brand: "Aditya Textile", fabric: "Georgette", colors: ["Royal Blue", "Silver"], pattern: "Sequin Work", occasions: ["Party", "Festive"], sizes: ["S", "M", "L"], purchasePrice: 2500, sellingPrice: 5999, discountPct: 15, finalPrice: 5099, stockTotal: 6, stockReserved: 0, stockAvailable: 6, imageUrls: [], description: "Floor-length Anarkali with matching dupatta and sequin embellishments.", notes: "Low stock \u2014 reorder pending", rackLocation: "B-11", tags: ["anarkali", "georgette", "party"], isActive: true, isFeatured: false, createdAt: "2024-01-06T00:00:00Z", updatedAt: "2024-01-06T00:00:00Z" },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_001", name: "Rajeev Kumar", phone: "+91 98765 43210", email: "rajeev@email.com", address: "Gaya, Bihar", notes: "Regular customer", loyaltyPoints: 450, totalVisits: 6, isActive: true, createdAt: "2024-01-01T00:00:00Z", lastVisitAt: "2024-06-01T00:00:00Z" },
  { id: "cust_002", name: "Meena Gupta", phone: "+91 87654 32109", email: "", address: "Pune", notes: "Budget: \u20b95000-10000", loyaltyPoints: 120, totalVisits: 2, isActive: true, createdAt: "2024-02-01T00:00:00Z", lastVisitAt: "2024-05-15T00:00:00Z" },
  { id: "cust_003", name: "Sunita Patel", phone: "+91 76543 21098", email: "sunita@email.com", address: "Nashik", notes: "Bridal shopping \u2014 wedding in Dec", loyaltyPoints: 80, totalVisits: 1, isActive: true, createdAt: "2024-06-01T00:00:00Z", lastVisitAt: "2024-06-10T00:00:00Z" },
];

const today = new Date().toISOString().split("T")[0] ?? "2024-06-26";
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0] ?? "2024-06-27";

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "apt_001", customerId: "cust_001", customerName: "Rajeev Kumar", customerPhone: "+91 98765 43210", date: today, time: "11:00", status: "confirmed", assignedStaffId: "staff_001", notes: "Wedding shopping", totalItems: 3, createdAt: "2024-06-20T10:00:00Z", updatedAt: "2024-06-22T10:00:00Z" },
  { id: "apt_002", customerId: "cust_002", customerName: "Meena Gupta", customerPhone: "+91 87654 32109", date: today, time: "15:00", status: "preparing", assignedStaffId: "staff_001", notes: "Needs Kurtis and Salwar suits", totalItems: 2, createdAt: "2024-06-21T10:00:00Z", updatedAt: "2024-06-25T10:00:00Z" },
  { id: "apt_003", customerId: "cust_003", customerName: "Sunita Patel", customerPhone: "+91 76543 21098", date: tomorrow, time: "14:00", status: "pending", assignedStaffId: "", notes: "Bridal lehenga + sarees", totalItems: 4, createdAt: "2024-06-24T10:00:00Z", updatedAt: "2024-06-24T10:00:00Z" },
];

export const MOCK_APPOINTMENT_ITEMS: AppointmentItem[] = [
  { id: "item_001", appointmentId: "apt_001", productId: "prod_001", productName: "Banarasi Silk Saree - Gold Zari", productSku: "SAR-BAN-001", quantity: 1, notes: "Show gold and red variants", isPrepared: true },
  { id: "item_002", appointmentId: "apt_001", productId: "prod_003", productName: "Bridal Lehenga - Crimson Velvet", productSku: "LEH-BRI-001", quantity: 1, notes: "Size M preferred", isPrepared: true },
  { id: "item_003", appointmentId: "apt_001", productId: "prod_005", productName: "Kids Ghagra Set - Festival", productSku: "KID-GHG-001", quantity: 1, notes: "For 6-7 year old", isPrepared: false },
  { id: "item_004", appointmentId: "apt_002", productId: "prod_004", productName: "Block Print Kurti - Indigo", productSku: "KUR-BLK-001", quantity: 2, notes: "Size M and L", isPrepared: true },
  { id: "item_005", appointmentId: "apt_002", productId: "prod_006", productName: "Anarkali Salwar Suit - Royal Blue", productSku: "SAL-ANK-001", quantity: 1, notes: "", isPrepared: false },
];
