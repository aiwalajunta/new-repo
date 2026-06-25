import { z } from "zod";

const isoDateString = z.string().datetime({ offset: true }).or(z.string().datetime());
const boolString = z.string().transform((v) => v.toLowerCase() === "true").or(z.boolean());
const numString = z.string().transform((v) => Number(v)).pipe(z.number()).or(z.number());
const optionalString = z.string().optional().default("");
const csvString = z.string().transform((v) => (v ? v.split(",").map((s) => s.trim()) : [])).or(z.array(z.string()));

export const UserSchema = z.object({ id: z.string().min(1), role: z.enum(["owner", "customer"]), email: z.string().email().or(z.literal("")), phone: z.string(), passwordHash: z.string(), name: z.string().min(1), createdAt: isoDateString, lastLoginAt: isoDateString, isActive: boolString });
export type User = z.infer<typeof UserSchema>;
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, lastLoginAt: true }).extend({ password: z.string().min(8).optional() });
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const CategorySchema = z.object({ id: z.string().min(1), name: z.string().min(1), slug: z.string().min(1), parentId: optionalString, displayOrder: numString, iconUrl: optionalString, isActive: boolString });
export type Category = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({ id: z.string().min(1), title: z.string().min(1), slug: z.string().min(1), categoryId: z.string().min(1), description: z.string(), fabric: z.string(), occasion: csvString, basePrice: numString, discountPct: numString, finalPrice: numString, tags: csvString, isNewArrival: boolString, isTrending: boolString, isActive: boolString, createdAt: isoDateString, updatedAt: isoDateString });
export type Product = z.infer<typeof ProductSchema>;
export const CreateProductSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true, finalPrice: true });
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const ProductImageSchema = z.object({ id: z.string().min(1), productId: z.string().min(1), cloudinaryUrl: z.string().url(), displayOrder: numString, isPrimary: boolString });
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductVariantSchema = z.object({ id: z.string().min(1), productId: z.string().min(1), size: z.string(), color: z.string(), sku: z.string(), stock: numString, priceOverride: numString.optional() });
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const WishlistSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), productId: z.string().min(1), addedAt: isoDateString });
export type Wishlist = z.infer<typeof WishlistSchema>;

export const CartSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), productVariantId: z.string().min(1), quantity: numString, addedAt: isoDateString });
export type Cart = z.infer<typeof CartSchema>;

export const ReservationSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), productVariantId: z.string().min(1), visitDate: z.string(), visitTime: z.string(), status: z.enum(["pending","confirmed","ready","completed","cancelled","expired"]), notes: optionalString, createdAt: isoDateString, expiresAt: isoDateString });
export type Reservation = z.infer<typeof ReservationSchema>;
export const CreateReservationSchema = ReservationSchema.omit({ id: true, status: true, createdAt: true, expiresAt: true });
export type CreateReservation = z.infer<typeof CreateReservationSchema>;

export const ReviewSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), productId: z.string().min(1), rating: numString.pipe(z.number().min(1).max(5)), text: z.string(), photoUrls: csvString, createdAt: isoDateString, isApproved: boolString });
export type Review = z.infer<typeof ReviewSchema>;

export const NotificationSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), type: z.enum(["reservation_confirmed","reservation_ready","reservation_expired","price_drop","restock","new_arrival","festive_launch","loyalty_reward"]), title: z.string(), body: z.string(), payload: z.string(), sentAt: isoDateString, readAt: isoDateString.or(z.literal("")), channel: z.enum(["push","whatsapp","email"]) });
export type Notification = z.infer<typeof NotificationSchema>;

export const LoyaltyLedgerSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), points: numString, reason: z.string(), balance: numString, createdAt: isoDateString });
export type LoyaltyLedger = z.infer<typeof LoyaltyLedgerSchema>;

export const FamilySizeSchema = z.object({ id: z.string().min(1), customerId: z.string().min(1), memberLabel: z.string(), gender: z.enum(["male","female","kids_boy","kids_girl"]), ageGroup: z.enum(["adult","teen","child","toddler"]), measurements: z.string() });
export type FamilySize = z.infer<typeof FamilySizeSchema>;

export const AuditLogSchema = z.object({ id: z.string().min(1), actorId: z.string().min(1), action: z.string(), entity: z.string(), entityId: z.string(), diff: z.string(), timestamp: isoDateString });
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const SHEET_SCHEMAS = { Users: UserSchema, Categories: CategorySchema, Products: ProductSchema, ProductImages: ProductImageSchema, ProductVariants: ProductVariantSchema, Wishlists: WishlistSchema, Carts: CartSchema, Reservations: ReservationSchema, Reviews: ReviewSchema, Notifications: NotificationSchema, LoyaltyLedger: LoyaltyLedgerSchema, FamilySizes: FamilySizeSchema, AuditLog: AuditLogSchema } as const;
export type SheetName = keyof typeof SHEET_SCHEMAS;

export const SHEET_HEADERS: Record<SheetName, string[]> = {
  Users: ["id","role","email","phone","passwordHash","name","createdAt","lastLoginAt","isActive"],
  Categories: ["id","name","slug","parentId","displayOrder","iconUrl","isActive"],
  Products: ["id","title","slug","categoryId","description","fabric","occasion","basePrice","discountPct","finalPrice","tags","isNewArrival","isTrending","isActive","createdAt","updatedAt"],
  ProductImages: ["id","productId","cloudinaryUrl","displayOrder","isPrimary"],
  ProductVariants: ["id","productId","size","color","sku","stock","priceOverride"],
  Wishlists: ["id","customerId","productId","addedAt"],
  Carts: ["id","customerId","productVariantId","quantity","addedAt"],
  Reservations: ["id","customerId","productVariantId","visitDate","visitTime","status","notes","createdAt","expiresAt"],
  Reviews: ["id","customerId","productId","rating","text","photoUrls","createdAt","isApproved"],
  Notifications: ["id","customerId","type","title","body","payload","sentAt","readAt","channel"],
  LoyaltyLedger: ["id","customerId","points","reason","balance","createdAt"],
  FamilySizes: ["id","customerId","memberLabel","gender","ageGroup","measurements"],
  AuditLog: ["id","actorId","action","entity","entityId","diff","timestamp"],
};
