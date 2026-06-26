import { z } from "zod";

const isoDate = z.string().datetime({ offset: true }).or(z.string().datetime());
const bool = z.string().transform((v) => v.toLowerCase() === "true").or(z.boolean());
const num = z.string().transform((v) => Number(v)).pipe(z.number()).or(z.number());
const opt = z.string().optional().default("");
const csv = z.string().transform((v) => v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []).or(z.array(z.string()));

export const ProductSchema = z.object({ id: z.string().min(1), name: z.string().min(1), sku: z.string(), barcode: opt, categoryId: z.string(), brand: opt, fabric: opt, colors: csv, pattern: opt, occasions: csv, sizes: csv, purchasePrice: num, sellingPrice: num, discountPct: num, finalPrice: num, stockTotal: num, stockReserved: num, stockAvailable: num, imageUrls: csv, description: opt, notes: opt, rackLocation: opt, tags: csv, isActive: bool, isFeatured: bool, createdAt: isoDate, updatedAt: isoDate });
export type Product = z.infer<typeof ProductSchema>;
export const CreateProductSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true, stockReserved: true, stockAvailable: true, finalPrice: true });
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const CategorySchema = z.object({ id: z.string().min(1), name: z.string().min(1), nameHi: opt, slug: z.string().min(1), parentId: opt, displayOrder: num, icon: opt, isActive: bool });
export type Category = z.infer<typeof CategorySchema>;

export const CustomerSchema = z.object({ id: z.string().min(1), name: z.string().min(1), phone: z.string(), email: opt, address: opt, notes: opt, loyaltyPoints: num, totalVisits: num, isActive: bool, createdAt: isoDate, lastVisitAt: opt });
export type Customer = z.infer<typeof CustomerSchema>;

export const StaffSchema = z.object({ id: z.string().min(1), name: z.string().min(1), phone: z.string(), email: opt, role: z.enum(["owner", "staff"]), passwordHash: z.string(), isActive: bool, createdAt: isoDate });
export type Staff = z.infer<typeof StaffSchema>;

export const AppointmentStatusSchema = z.enum(["pending","confirmed","preparing","ready","arrived","trial","purchased","closed","cancelled"]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSchema = z.object({ id: z.string().min(1), customerId: z.string(), customerName: z.string(), customerPhone: z.string(), date: z.string(), time: z.string(), status: AppointmentStatusSchema, assignedStaffId: opt, notes: opt, totalItems: num, createdAt: isoDate, updatedAt: isoDate });
export type Appointment = z.infer<typeof AppointmentSchema>;
export const CreateAppointmentSchema = AppointmentSchema.omit({ id: true, status: true, createdAt: true, updatedAt: true, totalItems: true });
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;

export const AppointmentItemSchema = z.object({ id: z.string().min(1), appointmentId: z.string().min(1), productId: z.string(), productName: z.string(), productSku: opt, quantity: num, notes: opt, isPrepared: bool });
export type AppointmentItem = z.infer<typeof AppointmentItemSchema>;

export const InventoryMovementSchema = z.object({ id: z.string().min(1), productId: z.string().min(1), type: z.enum(["in","out","reserved","released","adjustment"]), quantity: num, reason: opt, reference: opt, staffId: opt, createdAt: isoDate });
export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;

export const TaskSchema = z.object({ id: z.string().min(1), appointmentId: z.string().min(1), appointmentItemId: opt, assignedStaffId: z.string(), title: z.string(), status: z.enum(["pending","in_progress","done"]), dueAt: opt, completedAt: opt, notes: opt, createdAt: isoDate });
export type Task = z.infer<typeof TaskSchema>;

export const NotificationSchema = z.object({ id: z.string().min(1), recipientId: z.string(), recipientType: z.enum(["staff","customer"]), type: z.enum(["appointment_confirmed","appointment_reminder","low_stock","task_assigned","product_ready"]), title: z.string(), body: z.string(), channel: z.enum(["push","whatsapp","sms","email"]), sentAt: isoDate, readAt: opt });
export type Notification = z.infer<typeof NotificationSchema>;

export const SettingSchema = z.object({ key: z.string().min(1), value: z.string(), label: opt, updatedAt: isoDate });
export type Setting = z.infer<typeof SettingSchema>;

export const FestiveCollectionSchema = z.object({ id: z.string().min(1), name: z.string(), nameHi: opt, startDate: z.string(), endDate: z.string(), productIds: csv, isActive: bool, bannerColor: opt });
export type FestiveCollection = z.infer<typeof FestiveCollectionSchema>;

export const PriceHistorySchema = z.object({ id: z.string().min(1), productId: z.string().min(1), oldPrice: num, newPrice: num, changedBy: z.string(), reason: opt, changedAt: isoDate });
export type PriceHistory = z.infer<typeof PriceHistorySchema>;

export const AuditLogSchema = z.object({ id: z.string().min(1), actorId: z.string(), actorName: z.string(), action: z.string(), entity: z.string(), entityId: z.string(), diff: opt, timestamp: isoDate });
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const SHEET_SCHEMAS = { Products: ProductSchema, Categories: CategorySchema, Customers: CustomerSchema, Staff: StaffSchema, Appointments: AppointmentSchema, AppointmentItems: AppointmentItemSchema, Inventory: InventoryMovementSchema, Tasks: TaskSchema, Notifications: NotificationSchema, Settings: SettingSchema, FestiveCollections: FestiveCollectionSchema, PriceHistory: PriceHistorySchema, AuditLog: AuditLogSchema } as const;
export type SheetName = keyof typeof SHEET_SCHEMAS;

export const SHEET_HEADERS: Record<SheetName, string[]> = {
  Products: ["id","name","sku","barcode","categoryId","brand","fabric","colors","pattern","occasions","sizes","purchasePrice","sellingPrice","discountPct","finalPrice","stockTotal","stockReserved","stockAvailable","imageUrls","description","notes","rackLocation","tags","isActive","isFeatured","createdAt","updatedAt"],
  Categories: ["id","name","nameHi","slug","parentId","displayOrder","icon","isActive"],
  Customers: ["id","name","phone","email","address","notes","loyaltyPoints","totalVisits","isActive","createdAt","lastVisitAt"],
  Staff: ["id","name","phone","email","role","passwordHash","isActive","createdAt"],
  Appointments: ["id","customerId","customerName","customerPhone","date","time","status","assignedStaffId","notes","totalItems","createdAt","updatedAt"],
  AppointmentItems: ["id","appointmentId","productId","productName","productSku","quantity","notes","isPrepared"],
  Inventory: ["id","productId","type","quantity","reason","reference","staffId","createdAt"],
  Tasks: ["id","appointmentId","appointmentItemId","assignedStaffId","title","status","dueAt","completedAt","notes","createdAt"],
  Notifications: ["id","recipientId","recipientType","type","title","body","channel","sentAt","readAt"],
  Settings: ["key","value","label","updatedAt"],
  FestiveCollections: ["id","name","nameHi","startDate","endDate","productIds","isActive","bannerColor"],
  PriceHistory: ["id","productId","oldPrice","newPrice","changedBy","reason","changedAt"],
  AuditLog: ["id","actorId","actorName","action","entity","entityId","diff","timestamp"],
};
