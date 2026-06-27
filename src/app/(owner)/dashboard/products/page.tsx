"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Package, Edit2, Trash2, X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Sparkles, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils/format";
import { MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { STOCK_LOW_THRESHOLD, PRODUCT_FABRICS, PRODUCT_OCCASIONS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/product-store";
import type { Product } from "@/lib/sheets/schemas";

type Tab = "details" | "images" | "stock";
type StockFilter = "all" | "low" | "out";
interface ExtractedRow { name: string; brand: string; price: number; category: string; sku: string; notes: string; }

const empty = (): Partial<Product> => ({ name:"",sku:"",barcode:"",categoryId:"",brand:"Aditya Textile",fabric:"",colors:[],pattern:"",occasions:[],sizes:[],purchasePrice:0,sellingPrice:0,discountPct:0,finalPrice:0,stockTotal:0,stockReserved:0,stockAvailable:0,imageUrls:[],description:"",notes:"",rackLocation:"",tags:[],isActive:true,isFeatured:false });
const calcFinal = (sell: number, disc: number) => Math.round(sell * (1 - disc / 100));
const getCatIcon = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.icon ?? "\ud83d\udc58";
const getCatName = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? "\u2014";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(file); });
}

function ProductFormDialog({ product, open, onClose, onSave }: { product: Partial<Product>|null; open:boolean; onClose:()=>void; onSave:(p:Partial<Product>)=>void }) {
  const isEdit = !!product?.id;
  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState<Partial<Product>>(product ?? empty());
  const [dragOver, setDragOver] = useState(false);
  const [stockAdj, setStockAdj] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const aiFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(product ?? empty()); setTab("details"); setStockAdj(0); }, [product]);
  const set = (k: keyof Product, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const csvField = (k: keyof Product) => ({ value: Array.isArray(form[k]) ? (form[k] as string[]).join(", ") : "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value.split(",").map((s) => s.trim()).filter(Boolean)) });

  const handleImageUpload = useCallback(async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setUploading(true);
    try { const urls = await Promise.all(imgs.map(fileToDataUrl)); set("imageUrls", [...(form.imageUrls ?? []), ...urls]); toast({ title: `${imgs.length} photo(s) uploaded \u2713`, variant: "success" }); }
    catch { toast({ title: "Failed to load images", variant: "error" }); }
    finally { setUploading(false); }
  }, [form.imageUrls]);

  const handleAiScan = async (file: File) => {
    setAiScanning(true);
    toast({ title: "\ud83e\udd16 Scanning photo...", variant: "default" });
    try {
      const dataUrl = await fileToDataUrl(file);
      const base64 = dataUrl.split(",")[1];
      const res = await fetch("/api/ai-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, currentForm: form }) });
      if (!res.ok) throw new Error();
      const data = await res.json() as Partial<Product> & { confidence?: string };
      const merged: Partial<Product> = { ...form };
      for (const key of ["name", "brand", "fabric", "colors", "pattern", "description", "occasions", "sizes"] as const) {
        const val = data[key as keyof typeof data]; const cur = merged[key as keyof Product];
        if (val && (!cur || (Array.isArray(cur) ? cur.length === 0 : String(cur).trim() === ""))) (merged as Record<string, unknown>)[key] = val;
      }
      merged.imageUrls = [dataUrl, ...(form.imageUrls ?? [])];
      setForm(merged); setTab("details");
      toast({ title: `\u2705 Details extracted! ${data.confidence ?? ""}`, variant: "success" });
    } catch { toast({ title: "Could not extract. Fill manually.", variant: "error" }); }
    finally { setAiScanning(false); }
  };

  const applyAdj = () => { const tot = Math.max(0, (form.stockTotal ?? 0) + stockAdj); set("stockTotal", tot); set("stockAvailable", Math.max(0, tot - (form.stockReserved ?? 0))); toast({ title: `Stock \u2192 ${tot}`, variant: "success" }); setStockAdj(0); };
  const handleSave = () => {
    if (!form.name?.trim()) { toast({ title: "Product Name required", variant: "error" }); return; }
    if (!form.categoryId) { toast({ title: "Category required", variant: "error" }); return; }
    if (!form.sellingPrice || form.sellingPrice <= 0) { toast({ title: "Selling Price must be > 0", variant: "error" }); return; }
    onSave({ ...form, finalPrice: calcFinal(form.sellingPrice ?? 0, form.discountPct ?? 0) }); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100"><DialogTitle className="font-display text-xl">{isEdit ? `Edit \u2014 ${form.name||"Product"}` : "Add New Product"}</DialogTitle><DialogDescription className="text-xs mt-0.5">{isEdit ? "Saved permanently \u2014 visible on all pages." : "Fill details to add to catalog."}</DialogDescription></div>
        <div className="flex border-b border-gray-200 px-6 gap-1">{(["details","images","stock"] as Tab[]).map((t) => (<button key={t} onClick={()=>setTab(t)} className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors mr-4 ${tab===t?"border-brand-wine text-brand-wine":"border-transparent text-gray-500 hover:text-gray-700"}`}>{t==="details"?"\ud83d\udccb Details":t==="images"?"\ud83d\uddbc\ufe0f Photos":"\ud83d\udce6 Stock"}</button>))}</div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab==="details" && (<div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Product Name *</label><Input placeholder="Banarasi Silk Saree" value={form.name??""} onChange={(e)=>set("name",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Brand / Company</label><Input placeholder="Aditya Textile" value={form.brand??""} onChange={(e)=>set("brand",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">SKU / Code</label><Input placeholder="SAR-001" value={form.sku??""} onChange={(e)=>set("sku",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Category *</label><select value={form.categoryId??""} onChange={(e)=>set("categoryId",e.target.value)} className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"><option value="">Select...</option>{MOCK_CATEGORIES.map((c)=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Fabric</label><select value={form.fabric??""} onChange={(e)=>set("fabric",e.target.value)} className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"><option value="">Select...</option>{PRODUCT_FABRICS.map((f)=><option key={f} value={f}>{f}</option>)}</select></div>
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Selling Price (\u20b9) *</label><Input type="number" min="0" placeholder="14999" value={form.sellingPrice||""} onChange={(e)=>{const v=Number(e.target.value);set("sellingPrice",v);set("finalPrice",calcFinal(v,form.discountPct??0));}}/></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Discount %</label><Input type="number" min="0" max="90" placeholder="0" value={form.discountPct||""} onChange={(e)=>{const v=Number(e.target.value);set("discountPct",v);set("finalPrice",calcFinal(form.sellingPrice??0,v));}}/></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Final Price</label><div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3"><span className="font-bold text-brand-wine text-sm">{formatPrice(form.finalPrice??0)}</span></div></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Purchase Price (\u20b9)</label><Input type="number" min="0" placeholder="8000" value={form.purchasePrice||""} onChange={(e)=>set("purchasePrice",Number(e.target.value))}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Barcode</label><Input placeholder="8901234567890" value={form.barcode??""} onChange={(e)=>set("barcode",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Color(s)</label><Input placeholder="Red, Gold" {...csvField("colors")}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Size(s)</label><Input placeholder="S, M, L, XL" {...csvField("sizes")}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Rack Location</label><Input placeholder="A-12" value={form.rackLocation??""} onChange={(e)=>set("rackLocation",e.target.value)}/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Pattern / Work</label><Input placeholder="Zari, Embroidery" value={form.pattern??""} onChange={(e)=>set("pattern",e.target.value)}/></div>
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Description</label><textarea rows={2} placeholder="Product description..." value={form.description??""} onChange={(e)=>set("description",e.target.value)} className="flex w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine"/></div>
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Remarks</label><Input placeholder="Internal notes..." value={form.notes??""} onChange={(e)=>set("notes",e.target.value)}/></div>
            <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-gray-600">Occasions</label><div className="flex flex-wrap gap-1.5">{PRODUCT_OCCASIONS.map((occ)=>{const on=(form.occasions??[]).includes(occ);return(<button key={occ} type="button" onClick={()=>set("occasions",on?(form.occasions??[]).filter((o)=>o!==occ):[...(form.occasions??[]),occ])} className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${on?"bg-brand-wine text-white border-brand-wine":"border-gray-200 text-gray-600 hover:border-brand-wine"}`}>{occ}</button>);})}</div></div>
            <div className="col-span-2 flex items-center gap-6 pt-1">{([["isActive","Active listing"],["isFeatured","Featured on home"]] as const).map(([k,label])=>(<label key={k} className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={!!form[k]} onChange={(e)=>set(k,e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-wine focus:ring-brand-wine"/><span className="text-sm text-gray-700">{label}</span></label>))}</div>
          </div>)}
          {tab==="images" && (<div className="space-y-4">
            <div onDrop={(e)=>{e.preventDefault();setDragOver(false);handleImageUpload(Array.from(e.dataTransfer.files));}} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${dragOver?"border-brand-wine bg-brand-rose":"border-gray-200 hover:border-brand-wine hover:bg-gray-50"}`}>
              {uploading?<><Sparkles size={20} className="animate-spin text-brand-wine"/><span className="text-sm font-medium text-brand-wine">Uploading...</span></>:<><Upload size={32} className="text-gray-400"/><div className="text-center"><p className="text-sm font-semibold text-gray-700">Tap to upload photos</p><p className="text-xs text-gray-400 mt-0.5">Pick multiple from gallery \u00b7 drag & drop</p></div></>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e)=>{if(e.target.files)handleImageUpload(Array.from(e.target.files));}}/>
            <button type="button" onClick={()=>aiFileRef.current?.click()} disabled={aiScanning} className="flex items-center gap-2 text-xs text-brand-wine hover:underline mx-auto disabled:opacity-50">
              <Sparkles size={13} className={aiScanning?"animate-spin":""}/>{aiScanning?"Scanning...":"\ud83e\udd16 Scan photo to auto-fill details (AI)"}
            </button>
            <input ref={aiFileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{if(e.target.files?.[0])handleAiScan(e.target.files[0]);}}/>
            {(form.imageUrls??[]).length===0?<div className="flex flex-col items-center gap-2 py-4 text-center"><ImageIcon size={32} className="text-gray-200"/><p className="text-sm text-gray-400">No photos yet.</p></div>
              :<div className="grid grid-cols-3 gap-3">{(form.imageUrls??[]).map((url,i)=>(<div key={i} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-gray-50"><img src={url} alt={`Photo ${i+1}`} className="h-full w-full object-cover"/>{i===0&&<span className="absolute top-1.5 left-1.5 bg-brand-wine text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRIMARY</span>}<button onClick={(e)=>{e.stopPropagation();set("imageUrls",(form.imageUrls??[]).filter((_,j)=>j!==i));}} className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button></div>))}</div>}
          </div>)}
          {tab==="stock" && (<div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">{[{label:"Total",val:form.stockTotal??0,color:"text-gray-900"},{label:"Reserved",val:form.stockReserved??0,color:"text-amber-600"},{label:"Available",val:form.stockAvailable??0,color:(form.stockAvailable??0)===0?"text-red-600":(form.stockAvailable??0)<=5?"text-amber-600":"text-green-600"}].map((s)=>(<div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"><p className={`font-display text-3xl font-bold ${s.color}`}>{s.val}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>))}</div>
            {!isEdit?<div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Opening Stock</label><Input type="number" min="0" placeholder="0" value={form.stockTotal||""} onChange={(e)=>{const v=Number(e.target.value);set("stockTotal",v);set("stockAvailable",v);}}/></div>
              :<div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4"><p className="text-sm font-semibold text-gray-800">Adjust Stock</p><div className="flex items-center justify-center gap-4"><button onClick={()=>setStockAdj((v)=>v-1)} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-500 text-xl font-bold transition-colors">\u2212</button><Input type="number" className="w-24 text-center text-xl font-bold h-11" value={stockAdj} onChange={(e)=>setStockAdj(Number(e.target.value))}/><button onClick={()=>setStockAdj((v)=>v+1)} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-500 text-xl font-bold transition-colors">+</button></div><div className="rounded-lg bg-gray-50 p-3 text-center text-sm">{stockAdj===0?<span className="text-gray-400">+ to add, \u2212 to remove</span>:stockAdj>0?<span className="text-green-700">Add {stockAdj} \u2192 <strong>{(form.stockTotal??0)+stockAdj}</strong></span>:<span className="text-red-700">Remove {Math.abs(stockAdj)} \u2192 <strong>{Math.max(0,(form.stockTotal??0)+stockAdj)}</strong></span>}</div><Button onClick={applyAdj} disabled={stockAdj===0} className="w-full gap-2" size="sm"><CheckCircle size={15}/> Apply</Button></div>}
          </div>)}
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleSave}><CheckCircle size={16}/> {isEdit?"Save Changes":"Add Product"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Photo Price List Import ─────────────────────────── */
function PhotoPriceListDialog({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (p: Partial<Product>[]) => void }) {
  const [step, setStep] = useState<"upload" | "extracting" | "preview" | "done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [editRows, setEditRows] = useState<ExtractedRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setStep("upload"); setCompany(""); setCategory(""); setEditRows([]); setError(""); onClose(); };

  const processImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Please upload an image file (JPG, PNG, screenshot)", variant: "error" }); return; }
    setStep("extracting"); setError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      const base64 = dataUrl.split(",")[1];
      const res = await fetch("/api/extract-pricelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });
      const data = await res.json() as { company?: string; category?: string; products?: ExtractedRow[]; error?: string };
      if (data.error && !data.products?.length) { setError(data.error); setStep("upload"); return; }
      setCompany(data.company ?? "");
      setCategory(data.category ?? "Sarees");
      setEditRows((data.products ?? []).map(r => ({ ...r })));
      if (data.error) setError(data.error);
      setStep("preview");
    } catch (e) { console.error(e); setError("Failed to process. Please try again."); setStep("upload"); }
  };

  const handleImport = () => {
    const catObj = MOCK_CATEGORIES.find(c => c.name.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(c.name.toLowerCase()));
    const products: Partial<Product>[] = editRows.filter(r => r.name.trim() && r.price > 0).map((r, i) => ({
      id: `photo_${Date.now()}_${i}`, name: r.name.trim(), brand: r.brand || company || "Aditya Textile",
      sku: `${(company || "AT").slice(0,3).toUpperCase()}-${Date.now()}-${i}`,
      categoryId: catObj?.id ?? "", sellingPrice: r.price, finalPrice: r.price,
      purchasePrice: 0, discountPct: 0, stockTotal: 0, stockAvailable: 0, stockReserved: 0,
      fabric: "", colors: [], sizes: [], pattern: "", occasions: [], imageUrls: [],
      description: "", notes: r.notes || "", rackLocation: "", barcode: "", tags: [],
      isActive: true, isFeatured: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }));
    onImport(products);
    setStep("done");
    toast({ title: `\u2705 ${products.length} products imported from price list!`, variant: "success" });
  };

  const updateRow = (i: number, field: keyof ExtractedRow, value: string | number) =>
    setEditRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const removeRow = (i: number) => setEditRows(prev => prev.filter((_, idx) => idx !== i));
  const validCount = editRows.filter(r => r.name.trim() && r.price > 0).length;

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 font-display text-xl">\ud83d\udcf8 Import from Price List Photo</DialogTitle>
          <DialogDescription className="text-xs mt-0.5">Upload any price list photo \u2014 AI extracts company, all product names and prices in one go</DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {step === "upload" && (<>
            <div onDrop={(e)=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files[0])processImage(e.dataTransfer.files[0]);}} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()}
              className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${dragOver?"border-brand-wine bg-brand-rose":"border-gray-200 hover:border-brand-wine hover:bg-gray-50"}`}>
              <div className="text-5xl">\ud83d\udcf8</div>
              <div className="text-center"><p className="font-semibold text-gray-700">Upload price list photo</p><p className="text-xs text-gray-400 mt-1">Printed list \u00b7 screenshot \u00b7 WhatsApp image \u00b7 PDF screenshot</p></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{if(e.target.files?.[0])processImage(e.target.files[0]);}}/>
            {error && <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">{error}</div>}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800">\ud83d\udca1 How it works</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>\u2022 Upload any price list photo like the sample (company heading + product names + prices)</p>
                <p>\u2022 AI reads the company name and extracts ALL rows in one go \u2014 even 50+ products</p>
                <p>\u2022 Review and edit any row before importing (remove errors, fix prices)</p>
                <p>\u2022 All products imported with prices \u2014 add photos and stock individually later</p>
                <p className="text-blue-400 mt-1">\u26a0\ufe0f Requires ANTHROPIC_API_KEY in Vercel \u2192 Settings \u2192 Environment Variables</p>
              </div>
            </div>
          </>)}

          {step === "extracting" && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-brand-wine border-t-transparent animate-spin" />
                <span className="text-3xl">\ud83e\udd16</span>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-gray-800">Extracting price list...</p>
                <p className="text-sm text-gray-500">AI is reading all product names and prices</p>
                <p className="text-xs text-gray-400">Takes 5\u201315 seconds for large lists</p>
              </div>
            </div>
          )}

          {step === "preview" && (<div className="space-y-4">
            {error && <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Company / Supplier</label><Input value={company} onChange={(e)=>setCompany(e.target.value)} placeholder="Company name"/></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">Category</label>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine">
                  {MOCK_CATEGORIES.map((c)=><option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{editRows.length} rows extracted \u2014 edit or remove before importing:</p>
              <span className="text-xs text-gray-400">Tap \u00d7 to remove</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="grid grid-cols-[1fr_110px_36px] gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-[11px] font-semibold text-gray-500 uppercase">Product Name</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase text-right">Price (\u20b9)</p>
                <span/>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {editRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_110px_36px] gap-2 items-center px-3 py-1.5">
                    <Input value={row.name} onChange={(e)=>updateRow(i,"name",e.target.value)} className="h-8 text-xs border-0 bg-transparent p-0 focus:ring-0 focus:border-b focus:border-brand-wine"/>
                    <Input type="number" value={row.price||""} onChange={(e)=>updateRow(i,"price",Number(e.target.value))} className="h-8 text-xs text-right"/>
                    <button onClick={()=>removeRow(i)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={()=>setStep("upload")}>\u2190 Try Another</Button>
              <Button className="flex-1 gap-2" style={{background:"#6B1D3A"}} onClick={handleImport} disabled={validCount===0}>
                <CheckCircle size={15}/> Import {validCount} Products
              </Button>
            </div>
          </div>)}

          {step === "done" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><CheckCircle size={40} className="text-green-600"/></div>
              <div className="text-center"><p className="font-display text-xl font-bold text-gray-900">Price List Imported!</p><p className="text-sm text-gray-500 mt-1">{validCount} products added to catalog</p></div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 text-center max-w-xs">
                \ud83d\udca1 Tap \u270f\ufe0f on any product to add stock, upload photos, and fill in more details.
              </div>
              <Button onClick={reset} className="mt-2">Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExcelImportDialog({ open, onClose, onImport }: { open:boolean; onClose:()=>void; onImport:(p:Partial<Product>[])=>void }) {
  const [step, setStep] = useState<"upload"|"preview"|"done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<Partial<Product>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const COLS = ["Brand","Category *","Product Name *","SKU","Selling Price *","Purchase Price","Discount %","Stock *","Colors","Sizes","Fabric","Pattern","Rack","Barcode","Description","Remarks","Image URL"];
  const SAMPLE = [["Aditya Textile","Sarees","Banarasi Silk Saree","SAR-001","14999","8000","10","5","Red, Gold","Free Size","Pure Silk","Zari","A-12","","Handwoven","Top seller","https://..."],
    ["XYZ Brand","Kurtis","Block Print Kurti","KUR-002","899","400","0","20","Indigo","S,M,L,XL","Cotton","","D-05","","","",""]];

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|csv)$/i)) { toast({ title: "Please upload .xlsx or .csv", variant: "error" }); return; }
    setLoading(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string,string>>(ws, { defval: "" });
      const products: Partial<Product>[] = []; const errs: string[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const get = (keys: string[]) => { for (const k of keys) { const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()]; if (v !== undefined && String(v).trim() !== "") return String(v).trim(); } return ""; };
        const name = get(["Product Name","Name","PRODUCT NAME","ProductName"]);
        const price = Number(get(["Selling Price","Price","MRP","Sell Price","Sale Price"])) || 0;
        const purchasePrice = Number(get(["Purchase Price","Cost","Cost Price","Buy Price"])) || 0;
        const stock = Number(get(["Stock","Qty","Quantity","Available Stock"])) || 0;
        const discount = Number(get(["Discount","Discount %","Disc %","Discount Percent"])) || 0;
        if (!name) { errs.push(`Row ${i+2}: Missing name \u2014 skipped`); continue; }
        const catName = get(["Category","CATEGORY","Type"]).toLowerCase();
        const cat = MOCK_CATEGORIES.find((c) => c.name.toLowerCase().includes(catName) || catName.includes(c.name.toLowerCase()));
        const sku = get(["SKU","Code","Product Code","Item Code"]) || `SKU-${Date.now()}-${i}`;
        const barcode = get(["Barcode","Bar Code","EAN","UPC"]);
        const finalPrice = price > 0 && discount > 0 ? Math.round(price * (1 - discount/100)) : price;
        const imageUrl = get(["Image","Image URL","Photo","Photo URL","Img","Picture"]);
        const imageUrls: string[] = imageUrl && imageUrl.startsWith("http") ? [imageUrl] : [];
        products.push({ id:`imp_${Date.now()}_${i}`,name,brand:get(["Brand","Company","Brand Name","Manufacturer"])||"Aditya Textile",sku,barcode,categoryId:cat?.id??"",fabric:get(["Fabric","Material","Fabric Type","Cloth"]),colors:get(["Colors","Color","Colours","Colour"]).split(",").map((s)=>s.trim()).filter(Boolean),sizes:get(["Sizes","Size","Available Sizes"]).split(",").map((s)=>s.trim()).filter(Boolean),rackLocation:get(["Rack","Rack Location","Shelf","Location","Rack No"]),notes:get(["Remarks","Notes","Comment","Remark"]),description:get(["Description","Details","Product Description"]),pattern:get(["Pattern","Design","Work","Embroidery"]),occasions:get(["Occasions","Occasion"]).split(",").map((s)=>s.trim()).filter(Boolean),tags:get(["Tags","Keywords"]).split(",").map((s)=>s.trim()).filter(Boolean),sellingPrice:price,purchasePrice,discountPct:discount,finalPrice:finalPrice||price,stockTotal:stock,stockAvailable:stock,stockReserved:0,imageUrls,isActive:true,isFeatured:get(["Featured","Is Featured"]).toLowerCase()==="yes",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString() });
      }
      setParsed(products); setErrors(errs); setStep("preview");
    } catch (err) { console.error(err); toast({ title: "Failed to read file", variant: "error" }); }
    finally { setLoading(false); }
  };

  const handleImport = () => { onImport(parsed); setStep("done"); };
  const reset = () => { setStep("upload"); setParsed([]); setErrors([]); onClose(); };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100"><DialogTitle className="flex items-center gap-2"><FileSpreadsheet size={20} className="text-green-600"/> Import from Excel / CSV</DialogTitle><DialogDescription className="text-xs mt-0.5">All 17 fields imported. Photos via URL column or upload after.</DialogDescription></div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {step==="upload" && (<>
            <div onDrop={(e)=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0]);}} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${dragOver?"border-green-500 bg-green-50":"border-gray-200 hover:border-green-400 hover:bg-gray-50"}`}>
              {loading?<><FileSpreadsheet size={36} className="text-green-500 animate-pulse"/><p className="text-sm text-gray-600">Reading...</p></>:<><FileSpreadsheet size={40} className="text-green-500"/><div className="text-center"><p className="font-semibold text-gray-700">Drop .xlsx or .csv here</p><p className="text-xs text-gray-400 mt-1">All product fields supported</p></div></>}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e)=>{if(e.target.files?.[0])processFile(e.target.files[0]);}}/>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-green-800">\ud83d\udce5 Template columns</p>
              <div className="overflow-x-auto rounded-lg border border-green-200"><table className="text-[10px] border-collapse w-full"><thead><tr className="bg-green-100">{COLS.map((c)=><th key={c} className="border border-green-200 px-2 py-1.5 text-left text-green-800 font-semibold whitespace-nowrap">{c}</th>)}</tr></thead><tbody>{SAMPLE.map((row,i)=><tr key={i} className={i%2===0?"bg-white":"bg-green-50/40"}>{row.map((cell,j)=><td key={j} className="border border-green-200 px-2 py-1 text-gray-600 whitespace-nowrap">{cell}</td>)}</tr>)}</tbody></table></div>
            </div>
          </>)}
          {step==="preview" && (<div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 p-3"><CheckCircle size={15} className="text-blue-600 shrink-0"/><p className="text-xs text-blue-700"><strong>{parsed.length} products</strong> ready{errors.length>0&&`, ${errors.length} skipped`}.</p></div>
            {errors.length>0&&<div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1">{errors.map((e,i)=><p key={i} className="text-xs text-amber-700">{e}</p>)}</div>}
            <div className="space-y-2 max-h-64 overflow-y-auto">{parsed.map((p,i)=>(<div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"><span>\u2705</span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{p.name}</p><p className="text-xs text-gray-400">{p.brand} \u00b7 {formatPrice(p.finalPrice??0)} \u00b7 Stock: {p.stockTotal}</p></div></div>))}</div>
            <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={()=>setStep("upload")}>\u2190 Back</Button><Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={handleImport} disabled={parsed.length===0}><CheckCircle size={15}/> Import {parsed.length}</Button></div>
          </div>)}
          {step==="done" && (<div className="flex flex-col items-center py-10 gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle size={32} className="text-green-600"/></div><p className="font-display text-xl font-bold text-gray-900">Import Complete!</p><p className="text-sm text-gray-500">{parsed.length} products saved</p><Button onClick={reset} className="mt-2">Done</Button></div>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({ product, onConfirm, onCancel }: { product: Product; onConfirm:()=>void; onCancel:()=>void }) {
  return (<Dialog open onOpenChange={onCancel}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Delete &ldquo;{product.name}&rdquo;?</DialogTitle><DialogDescription>Removed permanently from all pages.</DialogDescription></DialogHeader><div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button><Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm}>Yes, Delete</Button></div></DialogContent></Dialog>);
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const isOwner = (session?.user as { role?: string }|undefined)?.role === "owner";
  const { products, hydrated, addProduct, updateProduct, deleteProduct, importProducts } = useProductStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [formProduct, setFormProduct] = useState<Partial<Product>|null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [photoImportOpen, setPhotoImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product|null>(null);

  let filtered = products;
  if (search) { const q=search.toLowerCase(); filtered=filtered.filter((p)=>p.name.toLowerCase().includes(q)||(p.brand??"").toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||p.colors.some((c)=>c.toLowerCase().includes(q))||p.rackLocation.toLowerCase().includes(q)||getCatName(p.categoryId).toLowerCase().includes(q)); }
  if (catFilter) filtered=filtered.filter((p)=>p.categoryId===catFilter);
  if (stockFilter==="low") filtered=filtered.filter((p)=>p.stockAvailable>0&&p.stockAvailable<=STOCK_LOW_THRESHOLD);
  if (stockFilter==="out") filtered=filtered.filter((p)=>p.stockAvailable===0);

  const handleSave = (saved: Partial<Product>) => {
    if (saved.id) { updateProduct(saved.id, saved); toast({ title: "\u2713 Saved \u2014 updated everywhere", variant: "success" }); }
    else { addProduct(saved); toast({ title: "\u2713 Product added \u2014 visible on all pages", variant: "success" }); }
  };
  const handleDelete = () => { if (!deleteTarget) return; deleteProduct(deleteTarget.id); toast({ title: `"${deleteTarget.name}" deleted`, variant: "success" }); setDeleteTarget(null); };
  const handleImport = (imported: Partial<Product>[]) => { importProducts(imported); toast({ title: `\u2713 ${imported.length} products imported and saved`, variant: "success" }); };

  const low=products.filter((p)=>p.stockAvailable>0&&p.stockAvailable<=STOCK_LOW_THRESHOLD).length;
  const out=products.filter((p)=>p.stockAvailable===0).length;

  if (!hydrated) return (<div className="flex items-center justify-center py-20"><div className="text-center space-y-2"><Package size={32} className="mx-auto text-gray-300 animate-pulse"/><p className="text-sm text-gray-400">Loading catalog...</p></div></div>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Product Catalog</h1><p className="text-sm text-gray-500">{products.length} products{low>0&&<span className="ml-2 text-amber-600">\u00b7 \u26a0\ufe0f {low} low</span>}{out>0&&<span className="ml-2 text-red-600">\u00b7 \ud83d\udd34 {out} out</span>}</p>{!isOwner&&<p className="text-xs text-blue-600 mt-0.5">\ud83d\udc41\ufe0f Read-only \u2014 contact owner to edit</p>}</div>
        {isOwner&&(<div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={()=>setPhotoImportOpen(true)} title="Import from price list photo">
            <span>\ud83d\udcf8</span><span className="hidden sm:inline">Scan Price List</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={()=>setImportOpen(true)}><FileSpreadsheet size={15} className="text-green-600"/><span className="hidden sm:inline">Import Excel</span></Button>
          <Button size="sm" className="gap-2" onClick={()=>{setFormProduct(empty());setFormOpen(true);}}><Plus size={15}/> Add Product</Button>
        </div>)}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><Input placeholder="Search by name, brand, SKU, color, rack..." className="pl-9 h-10" value={search} onChange={(e)=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={15}/></button>}</div>
        <select value={catFilter} onChange={(e)=>setCatFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"><option value="">All Categories</option>{MOCK_CATEGORIES.map((c)=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden h-10">{(["all","low","out"] as StockFilter[]).map((f)=>(<button key={f} onClick={()=>setStockFilter(f)} className={`px-3 text-xs font-medium transition-colors ${stockFilter===f?"bg-brand-wine text-white":"text-gray-600 hover:bg-gray-50"}`}>{f==="all"?"All":f==="low"?"\u26a0\ufe0f Low":"\ud83d\udd34 Out"}</button>))}</div>
      </div>
      {search&&<p className="text-xs text-gray-500">{filtered.length===0?"No results":`${filtered.length} result${filtered.length!==1?"s":""}`} for &ldquo;{search}&rdquo;</p>}
      {filtered.length===0?(<div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center"><Package size={40} className="mx-auto mb-3 text-gray-300"/><p className="text-sm font-medium text-gray-500">No products match</p><Button variant="outline" size="sm" className="mt-4" onClick={()=>{setSearch("");setCatFilter("");setStockFilter("all");}}>Clear Filters</Button></div>)
        :(<AnimatePresence mode="popLayout"><div className="space-y-2">{filtered.map((p,i)=>(
          <motion.div key={p.id} layout initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.98}} transition={{delay:i*0.01}}>
            <Card className="hover:shadow-sm transition-shadow"><CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-2xl border border-brand-border overflow-hidden">{(p.imageUrls??[]).length>0?<img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover"/>:<span>{getCatIcon(p.categoryId)}</span>}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>{p.isFeatured&&<Badge variant="secondary" className="text-[9px] px-1.5 shrink-0">\u2605</Badge>}{!p.isActive&&<Badge variant="danger" className="text-[9px] px-1.5 shrink-0">OFF</Badge>}</div><div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-gray-400">{p.brand&&<><span className="font-medium text-gray-600">{p.brand}</span><span>\u00b7</span></>}<span>{getCatName(p.categoryId)}</span>{p.fabric&&<><span>\u00b7</span><span>{p.fabric}</span></>}{p.colors.length>0&&<><span>\u00b7</span><span>{p.colors.slice(0,2).join(", ")}</span></>}{p.sku&&<><span>\u00b7</span><span className="font-mono">{p.sku}</span></>}{p.rackLocation&&<><span>\u00b7</span><span className="font-medium text-blue-600">\ud83d\udccd{p.rackLocation}</span></>}</div></div>
              <div className="shrink-0 text-right min-w-[80px]"><p className="font-display font-bold text-brand-wine leading-tight">{formatPrice(p.finalPrice)}</p>{p.discountPct>0&&<p className="text-[10px] text-gray-400 line-through">{formatPrice(p.sellingPrice)}</p>}<p className={`text-[11px] font-semibold mt-0.5 ${p.stockAvailable===0?"text-red-600":p.stockAvailable<=STOCK_LOW_THRESHOLD?"text-amber-600":"text-gray-500"}`}>{p.stockAvailable===0?"\ud83d\udd34 OUT":p.stockAvailable<=STOCK_LOW_THRESHOLD?`\u26a0\ufe0f ${p.stockAvailable} left`:`${p.stockAvailable} in stock`}</p></div>
              <div className="flex gap-0.5 shrink-0">{isOwner?(<><button onClick={()=>{setFormProduct({...p});setFormOpen(true);}} title="Edit" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-wine/10 hover:text-brand-wine transition-colors"><Edit2 size={15}/></button><button onClick={()=>setDeleteTarget(p)} title="Delete" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15}/></button></>):(<button title="View only" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 cursor-default"><Eye size={15}/></button>)}</div>
            </CardContent></Card>
          </motion.div>
        ))}</div></AnimatePresence>)}
      <ProductFormDialog product={formProduct} open={formOpen} onClose={()=>{setFormOpen(false);setFormProduct(null);}} onSave={handleSave}/>
      <PhotoPriceListDialog open={photoImportOpen} onClose={()=>setPhotoImportOpen(false)} onImport={handleImport}/>
      <ExcelImportDialog open={importOpen} onClose={()=>setImportOpen(false)} onImport={handleImport}/>
      {deleteTarget&&<DeleteConfirm product={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)}/>}
    </div>
  );
}
