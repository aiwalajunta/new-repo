"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Package, Edit2, Trash2, X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils/format";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { STOCK_LOW_THRESHOLD, PRODUCT_FABRICS, PRODUCT_OCCASIONS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/sheets/schemas";

type Tab = "details" | "images" | "stock";
type StockFilter = "all" | "low" | "out";

const empty = (): Partial<Product> => ({ name:"",sku:"",barcode:"",categoryId:"",brand:"Aditya Textile",fabric:"",colors:[],pattern:"",occasions:[],sizes:[],purchasePrice:0,sellingPrice:0,discountPct:0,finalPrice:0,stockTotal:0,stockReserved:0,stockAvailable:0,imageUrls:[],description:"",notes:"",rackLocation:"",tags:[],isActive:true,isFeatured:false });
const calcFinal = (sell: number, disc: number) => Math.round(sell * (1 - disc / 100));
const getCatIcon = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.icon ?? "\ud83d\udc58";
const getCatName = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? "\u2014";

function ProductFormDialog({ product, open, onClose, onSave }: { product: Partial<Product> | null; open: boolean; onClose: () => void; onSave: (p: Partial<Product>) => void; }) {
  const isEdit = !!product?.id;
  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState<Partial<Product>>(product ?? empty());
  const [dragOver, setDragOver] = useState(false);
  const [stockAdj, setStockAdj] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(product ?? empty()); setTab("details"); setStockAdj(0); }, [product]);

  const set = (k: keyof Product, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const csvField = (k: keyof Product) => ({ value: Array.isArray(form[k]) ? (form[k] as string[]).join(", ") : "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value.split(",").map((s) => s.trim()).filter(Boolean)) });

  const fakeUpload = useCallback((files: File[]) => {
    const urls = files.map((f) => `https://placehold.co/400x533/F5EDE3/6B1D3A?text=${encodeURIComponent(f.name.slice(0, 12))}`);
    set("imageUrls", [...(form.imageUrls ?? []), ...urls]);
    toast({ title: `${files.length} image(s) added \u2014 connect Cloudinary for real uploads`, variant: "success" });
  }, [form.imageUrls]);

  const applyAdj = () => {
    const tot = Math.max(0, (form.stockTotal ?? 0) + stockAdj);
    set("stockTotal", tot); set("stockAvailable", Math.max(0, tot - (form.stockReserved ?? 0)));
    toast({ title: `Stock: ${form.stockTotal} \u2192 ${tot}`, variant: "success" }); setStockAdj(0);
  };

  const handleSave = () => {
    if (!form.name?.trim()) { toast({ title: "Product Name is required", variant: "error" }); return; }
    if (!form.categoryId) { toast({ title: "Category is required", variant: "error" }); return; }
    if (!form.sellingPrice || form.sellingPrice <= 0) { toast({ title: "Selling Price must be > 0", variant: "error" }); return; }
    onSave({ ...form, finalPrice: calcFinal(form.sellingPrice ?? 0, form.discountPct ?? 0) });
    toast({ title: isEdit ? "Product updated \u2713" : "Product added \u2713", variant: "success" }); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0">
        <div className="px-6 pt-5 pb-0"><DialogTitle className="font-display text-xl">{isEdit ? `Edit \u2014 ${form.name || "Product"}` : "Add New Product"}</DialogTitle><DialogDescription className="text-xs mt-0.5">{isEdit ? "Update product details, images and stock." : "Fill in details to add to the catalog."}</DialogDescription></div>
        <div className="flex border-b border-gray-200 px-6 mt-4 gap-1">
          {(["details","images","stock"] as Tab[]).map((t) => (<button key={t} onClick={() => setTab(t)} className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors mr-4 ${tab===t?"border-brand-wine text-brand-wine":"border-transparent text-gray-500 hover:text-gray-700"}`}>{t==="details"?"\ud83d\udccb Details":t==="images"?"\ud83d\uddbc\ufe0f Images":"\ud83d\udce6 Stock"}</button>))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab==="details" && (<div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Product Name *</label><Input placeholder="Banarasi Silk Saree - Gold Zari" value={form.name??""} onChange={(e)=>set("name",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Brand / Company</label><Input placeholder="Aditya Textile" value={form.brand??""} onChange={(e)=>set("brand",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Product Code / SKU</label><Input placeholder="SAR-BAN-001" value={form.sku??""} onChange={(e)=>set("sku",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Category *</label><select value={form.categoryId??""} onChange={(e)=>set("categoryId",e.target.value)} className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"><option value="">Select...</option>{MOCK_CATEGORIES.map((c)=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Fabric</label><select value={form.fabric??""} onChange={(e)=>set("fabric",e.target.value)} className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"><option value="">Select...</option>{PRODUCT_FABRICS.map((f)=><option key={f} value={f}>{f}</option>)}</select></div>
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Selling Price (\u20b9) *</label><Input type="number" min="0" placeholder="14999" value={form.sellingPrice||""} onChange={(e)=>{const v=Number(e.target.value);set("sellingPrice",v);set("finalPrice",calcFinal(v,form.discountPct??0));}}/></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Discount %</label><Input type="number" min="0" max="90" placeholder="0" value={form.discountPct||""} onChange={(e)=>{const v=Number(e.target.value);set("discountPct",v);set("finalPrice",calcFinal(form.sellingPrice??0,v));}}/></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Final Price</label><div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3"><span className="font-bold text-brand-wine text-sm">{formatPrice(form.finalPrice??0)}</span></div></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Color(s)</label><Input placeholder="Red, Gold, Maroon" {...csvField("colors")}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Size(s)</label><Input placeholder="S, M, L, XL or Free Size" {...csvField("sizes")}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Rack / Shelf Location</label><Input placeholder="A-12" value={form.rackLocation??""} onChange={(e)=>set("rackLocation",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Barcode (optional)</label><Input placeholder="8901234567890" value={form.barcode??""} onChange={(e)=>set("barcode",e.target.value)}/></div>
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Remarks / Notes</label><textarea rows={2} placeholder="Available for alteration, top seller..." value={form.notes??""} onChange={(e)=>set("notes",e.target.value)} className="flex w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"/></div>
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Occasions</label><div className="flex flex-wrap gap-1.5">{PRODUCT_OCCASIONS.map((occ)=>{const on=(form.occasions??[]).includes(occ);return(<button key={occ} type="button" onClick={()=>set("occasions",on?(form.occasions??[]).filter((o)=>o!==occ):[...(form.occasions??[]),occ])} className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${on?"bg-brand-wine text-white border-brand-wine":"border-gray-200 text-gray-600 hover:border-brand-wine"}`}>{occ}</button>);})}</div></div>
            <div className="col-span-2 flex items-center gap-6 pt-1">{([["isActive","Active listing"],["isFeatured","Featured on home"]] as const).map(([k,label])=>(<label key={k} className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={!!form[k]} onChange={(e)=>set(k,e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-wine focus:ring-brand-wine"/><span className="text-sm text-gray-700">{label}</span></label>))}</div>
          </div>)}
          {tab==="images" && (<div className="space-y-4">
            <div onDrop={(e)=>{e.preventDefault();setDragOver(false);fakeUpload(Array.from(e.dataTransfer.files).filter((f)=>f.type.startsWith("image/")));}} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${dragOver?"border-brand-wine bg-brand-rose":"border-gray-200 hover:border-brand-wine hover:bg-gray-50"}`}>
              <Upload size={32} className="text-gray-400"/>
              <div className="text-center"><p className="text-sm font-semibold text-gray-700">Drag & drop product photos</p><p className="text-xs text-gray-400 mt-0.5">or click to browse \u00b7 JPG, PNG, WebP</p></div>
              <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5"><Sparkles size={12}/><span>Connect Cloudinary in Settings to save real photos</span></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e)=>{if(e.target.files)fakeUpload(Array.from(e.target.files));}}/>
            {(form.imageUrls??[]).length===0 ? (<div className="flex flex-col items-center gap-2 py-6 text-center"><ImageIcon size={32} className="text-gray-200"/><p className="text-sm text-gray-400">No images yet. Products without photos import fine.</p></div>) : (<div className="grid grid-cols-3 gap-3">{(form.imageUrls??[]).map((url,i)=>(<div key={i} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-gray-200"><img src={url} alt={`img${i}`} className="h-full w-full object-cover"/>{i===0 && <span className="absolute top-1.5 left-1.5 bg-brand-wine text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRIMARY</span>}<button onClick={()=>set("imageUrls",(form.imageUrls??[]).filter((_,j)=>j!==i))} className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button></div>))}</div>)}
          </div>)}
          {tab==="stock" && (<div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">{[{label:"Total",val:form.stockTotal??0,color:"text-gray-900"},{label:"Reserved",val:form.stockReserved??0,color:"text-amber-600"},{label:"Available",val:form.stockAvailable??0,color:(form.stockAvailable??0)===0?"text-red-600":(form.stockAvailable??0)<=5?"text-amber-600":"text-green-600"}].map((s)=>(<div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"><p className={`font-display text-3xl font-bold ${s.color}`}>{s.val}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>))}</div>
            {!isEdit ? (<div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Opening Stock</label><Input type="number" min="0" placeholder="0" value={form.stockTotal||""} onChange={(e)=>{const v=Number(e.target.value);set("stockTotal",v);set("stockAvailable",v);}}/><p className="text-xs text-gray-400">Adjust anytime after adding.</p></div>) : (<div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4"><p className="text-sm font-semibold text-gray-800">Adjust Stock Quantity</p><div className="flex items-center justify-center gap-4"><button onClick={()=>setStockAdj((v)=>v-1)} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-500 text-xl font-bold transition-colors">\u2212</button><Input type="number" className="w-24 text-center text-xl font-bold h-11" value={stockAdj} onChange={(e)=>setStockAdj(Number(e.target.value))}/><button onClick={()=>setStockAdj((v)=>v+1)} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-500 text-xl font-bold transition-colors">+</button></div><div className="rounded-lg bg-gray-50 p-3 text-center text-sm">{stockAdj===0 ? <span className="text-gray-400">Enter + to add, \u2212 to remove</span> : stockAdj>0 ? <span className="text-green-700">\u2795 Add {stockAdj} \u2192 New total: <strong>{(form.stockTotal??0)+stockAdj}</strong></span> : <span className="text-red-700">\u2796 Remove {Math.abs(stockAdj)} \u2192 New total: <strong>{Math.max(0,(form.stockTotal??0)+stockAdj)}</strong></span>}</div><Button onClick={applyAdj} disabled={stockAdj===0} className="w-full gap-2" size="sm"><CheckCircle size={15}/> Apply Adjustment</Button></div>)}
          </div>)}
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleSave}><CheckCircle size={16}/>{isEdit ? "Save Changes" : "Add Product"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExcelImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"upload"|"preview"|"done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const COLS = ["Brand","Category *","Product Name *","SKU/Code","Selling Price *","Stock *","Colors","Sizes","Fabric","Rack","Remarks"];
  const SAMPLE = [["Aditya Textile","Sarees","Banarasi Silk Saree","SAR-001","14999","5","Red, Gold","Free Size","Pure Silk","A-12","Top seller"],["XYZ Brand","Kurtis","Block Print Kurti","KUR-002","899","20","Indigo","S,M,L,XL","Cotton","D-05",""]];
  const handleFile = (f: File|null) => {
    if (!f) return;
    if (!f.name.match(/\.(xlsx|csv)$/i)) { toast({ title: "Upload .xlsx or .csv", variant: "error" }); return; }
    setTimeout(() => setStep("preview"), 800);
    toast({ title: `Reading "${f.name}"...` });
  };
  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setStep("upload"); }}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2"><FileSpreadsheet size={20} className="text-green-600"/> Import from Excel / CSV</DialogTitle>
          <DialogDescription className="text-xs mt-0.5">Bulk-import products. Photos are optional \u2014 add them individually after import.</DialogDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {step==="upload" && (
            <>
              <div onDrop={(e)=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]??null);}} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${dragOver?"border-green-500 bg-green-50":"border-gray-200 hover:border-green-400 hover:bg-gray-50"}`}>
                <FileSpreadsheet size={40} className="text-green-500"/>
                <div className="text-center"><p className="font-semibold text-gray-700">Drop Excel or CSV file here</p><p className="text-xs text-gray-400 mt-1">.xlsx and .csv \u00b7 Photos NOT required</p></div>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e)=>handleFile(e.target.files?.[0]??null)}/>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold text-green-800">\ud83d\udce5 Download Template</p><Button variant="outline" size="sm" className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100 text-xs" onClick={()=>toast({title:"Connect backend to enable download"})}><FileSpreadsheet size={13}/> Download .xlsx</Button></div>
                <p className="text-xs text-green-700">Columns marked * are required. <strong>Photos are optional</strong> \u2014 upload individually after import.</p>
                <div className="overflow-x-auto rounded-lg border border-green-200"><table className="text-[10px] border-collapse w-full"><thead><tr className="bg-green-100">{COLS.map((c)=><th key={c} className="border border-green-200 px-2 py-1.5 text-left text-green-800 font-semibold whitespace-nowrap">{c}</th>)}</tr></thead><tbody>{SAMPLE.map((row,i)=>(<tr key={i} className={i%2===0?"bg-white":"bg-green-50/40"}>{row.map((cell,j)=><td key={j} className="border border-green-200 px-2 py-1 text-gray-600 whitespace-nowrap">{cell}</td>)}</tr>))}</tbody></table></div>
              </div>
            </>
          )}
          {step==="preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3"><AlertTriangle size={15} className="text-amber-600 shrink-0"/><p className="text-xs text-amber-700">Review below. \u274c rows skipped. <strong>Photos not required</strong> \u2014 add after import.</p></div>
              {[
                {name:"Banarasi Silk Saree",brand:"Aditya Textile",cat:"Sarees",price:"\u20b914,999",stock:"5",ok:true},
                {name:"Block Print Kurti",brand:"XYZ Brand",cat:"Kurtis",price:"\u20b9899",stock:"20",ok:true},
                {name:"",brand:"",cat:"Unknown",price:"\u20b90",stock:"0",ok:false},
              ].map((row,i)=>(
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 ${row.ok?"border-gray-100 bg-gray-50":"border-red-200 bg-red-50"}`}>
                  <span className="text-base">{row.ok?"\u2705":"\u274c"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${row.ok?"text-gray-800":"text-red-600"}`}>{row.name||"Missing product name"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.brand} \u00b7 {row.cat} \u00b7 {row.price} \u00b7 Stock: {row.stock}</p>
                    {!row.ok && <p className="text-xs text-red-500 mt-1">\u26a0 Name required \u2014 will be skipped</p>}
                  </div>
                  <div className="text-right shrink-0"><span className="text-xs text-gray-400">No photo</span><p className="text-[10px] text-gray-300">Add later</p></div>
                </div>
              ))}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={()=>setStep("upload")}>\u2190 Back</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={() => { setStep("done"); toast({ title: "2 products imported!", variant: "success" }); }}>
                  <CheckCircle size={15}/> Import 2 Valid
                </Button>
              </div>
            </div>
          )}
          {step==="done" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle size={32} className="text-green-600"/></div>
              <div className="text-center"><p className="font-display text-xl font-bold text-gray-900">Import Complete!</p><p className="text-sm text-gray-500 mt-1">2 imported \u00b7 1 skipped (missing name)</p></div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 text-center max-w-xs">\ud83d\udca1 Products without photos are fully imported. Open any product \u2192 Images tab to add photos.</div>
              <Button onClick={() => { onClose(); setStep("upload"); }} className="gap-2 mt-2">Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({ product, onConfirm, onCancel }: { product: Product; onConfirm: () => void; onCancel: () => void }) {
  return (<Dialog open onOpenChange={onCancel}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Delete &ldquo;{product.name}&rdquo;?</DialogTitle><DialogDescription>This removes the product from the catalog.</DialogDescription></DialogHeader><div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button><Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm}>Yes, Delete</Button></div></DialogContent></Dialog>);
}

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [formProduct, setFormProduct] = useState<Partial<Product>|null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product|null>(null);

  let filtered = products;
  if (search) { const q=search.toLowerCase(); filtered=filtered.filter((p)=>p.name.toLowerCase().includes(q)||(p.brand??"").toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||p.fabric.toLowerCase().includes(q)||p.colors.some((c)=>c.toLowerCase().includes(q))||p.rackLocation.toLowerCase().includes(q)||p.tags.some((t)=>t.toLowerCase().includes(q))||getCatName(p.categoryId).toLowerCase().includes(q)); }
  if (catFilter) filtered=filtered.filter((p)=>p.categoryId===catFilter);
  if (stockFilter==="low") filtered=filtered.filter((p)=>p.stockAvailable>0&&p.stockAvailable<=STOCK_LOW_THRESHOLD);
  if (stockFilter==="out") filtered=filtered.filter((p)=>p.stockAvailable===0);

  const handleSave = (saved: Partial<Product>) => setProducts((prev)=>saved.id?prev.map((p)=>p.id===saved.id?{...p,...saved}as Product:p):[{...saved,id:`prod_${Date.now()}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}as Product,...prev]);
  const handleDelete = () => { if(!deleteTarget)return; setProducts((prev)=>prev.filter((p)=>p.id!==deleteTarget.id)); toast({title:`"${deleteTarget.name}" deleted`,variant:"success"}); setDeleteTarget(null); };
  const low=products.filter((p)=>p.stockAvailable>0&&p.stockAvailable<=STOCK_LOW_THRESHOLD).length;
  const out=products.filter((p)=>p.stockAvailable===0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Product Catalog</h1><p className="text-sm text-gray-500">{products.length} products{low>0 && <span className="ml-2 text-amber-600">\u00b7 \u26a0\ufe0f {low} low</span>}{out>0 && <span className="ml-2 text-red-600">\u00b7 \ud83d\udd34 {out} out</span>}</p></div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={()=>setImportOpen(true)}><FileSpreadsheet size={15} className="text-green-600"/><span className="hidden sm:inline">Import Excel</span></Button>
          <Button size="sm" className="gap-2" onClick={()=>{setFormProduct(empty());setFormOpen(true);}}><Plus size={15}/> Add Product</Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><Input placeholder="Search by name, brand, SKU, color, rack..." className="pl-9 h-10" value={search} onChange={(e)=>setSearch(e.target.value)}/>{search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={15}/></button>}</div>
        <select value={catFilter} onChange={(e)=>setCatFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"><option value="">All Categories</option>{MOCK_CATEGORIES.map((c)=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden h-10">{(["all","low","out"] as StockFilter[]).map((f)=>(<button key={f} onClick={()=>setStockFilter(f)} className={`px-3 text-xs font-medium transition-colors ${stockFilter===f?"bg-brand-wine text-white":"text-gray-600 hover:bg-gray-50"}`}>{f==="all"?"All Stock":f==="low"?"\u26a0\ufe0f Low":"\ud83d\udd34 Out"}</button>))}</div>
      </div>
      {search && <p className="text-xs text-gray-500">{filtered.length===0?"No results":`${filtered.length} result${filtered.length!==1?"s":""}`} for &ldquo;{search}&rdquo;</p>}
      {filtered.length===0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center"><Package size={40} className="mx-auto mb-3 text-gray-300"/><p className="text-sm text-gray-500">No products match</p><Button variant="outline" size="sm" className="mt-4" onClick={()=>{setSearch("");setCatFilter("");setStockFilter("all");}}>Clear Filters</Button></div>
      ) : (
        <AnimatePresence mode="popLayout"><div className="space-y-2">{filtered.map((p,i)=>(
          <motion.div key={p.id} layout initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.98}} transition={{delay:i*0.01}}>
            <Card className="hover:shadow-sm transition-shadow"><CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-2xl border border-brand-border overflow-hidden">{(p.imageUrls??[]).length>0 ? <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover"/> : <span>{getCatIcon(p.categoryId)}</span>}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap"><p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>{p.isFeatured && <Badge variant="secondary" className="text-[9px] px-1.5 shrink-0">\u2605</Badge>}{!p.isActive && <Badge variant="danger" className="text-[9px] px-1.5 shrink-0">OFF</Badge>}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-gray-400">{p.brand && <><span className="font-medium text-gray-600">{p.brand}</span><span>\u00b7</span></>}<span>{getCatName(p.categoryId)}</span>{p.fabric && <><span>\u00b7</span><span>{p.fabric}</span></>}{p.colors.length>0 && <><span>\u00b7</span><span>{p.colors.slice(0,2).join(", ")}</span></>}{p.sku && <><span>\u00b7</span><span className="font-mono">{p.sku}</span></>}{p.rackLocation && <><span>\u00b7</span><span className="font-medium text-blue-600">\ud83d\udccd{p.rackLocation}</span></>}</div>
              </div>
              <div className="shrink-0 text-right min-w-[80px]"><p className="font-display font-bold text-brand-wine leading-tight">{formatPrice(p.finalPrice)}</p>{p.discountPct>0 && <p className="text-[10px] text-gray-400 line-through">{formatPrice(p.sellingPrice)}</p>}<p className={`text-[11px] font-semibold mt-0.5 ${p.stockAvailable===0?"text-red-600":p.stockAvailable<=STOCK_LOW_THRESHOLD?"text-amber-600":"text-gray-500"}`}>{p.stockAvailable===0?"\ud83d\udd34 OUT":p.stockAvailable<=STOCK_LOW_THRESHOLD?`\u26a0\ufe0f ${p.stockAvailable} left`:`${p.stockAvailable} in stock`}</p></div>
              <div className="flex gap-0.5 shrink-0"><button onClick={()=>{setFormProduct({...p});setFormOpen(true);}} title="Edit" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-wine/10 hover:text-brand-wine transition-colors"><Edit2 size={15}/></button><button onClick={()=>setDeleteTarget(p)} title="Delete" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15}/></button></div>
            </CardContent></Card>
          </motion.div>
        ))}</div></AnimatePresence>
      )}
      <ProductFormDialog product={formProduct} open={formOpen} onClose={()=>{setFormOpen(false);setFormProduct(null);}} onSave={handleSave}/>
      <ExcelImportDialog open={importOpen} onClose={()=>setImportOpen(false)}/>
      {deleteTarget && <DeleteConfirm product={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)}/>}
    </div>
  );
}
