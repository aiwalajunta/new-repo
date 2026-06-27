"use client";
import { useState } from "react";
import { Search, Camera, Sparkles, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils/format";
import { MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { STOCK_LOW_THRESHOLD } from "@/lib/constants";
import { useProductStore } from "@/store/product-store";
import type { Product } from "@/lib/sheets/schemas";

const getCatIcon = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.icon ?? "\ud83d\udc58";
const getCatName = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? "\u2014";

function ProductSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-lg leading-tight pr-6">{product.name}</DialogTitle><DialogDescription>{getCatName(product.categoryId)} \u00b7 {product.fabric}</DialogDescription></DialogHeader>
        <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-brand-cream to-brand-rose flex items-center justify-center border border-brand-border">
          {(product.imageUrls??[]).length>0?<img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover"/>:<span className="text-7xl">{getCatIcon(product.categoryId)}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-brand-border bg-brand-wine/5 p-3 text-center"><p className="text-xs text-gray-500">Selling Price</p><p className="font-display text-xl font-bold text-brand-wine mt-0.5">{formatPrice(product.finalPrice)}</p>{product.discountPct>0&&<p className="text-xs text-gray-400 line-through">{formatPrice(product.sellingPrice)}</p>}</div>
          <div className={`rounded-xl border p-3 text-center ${product.stockAvailable===0?"border-red-200 bg-red-50":product.stockAvailable<=STOCK_LOW_THRESHOLD?"border-amber-200 bg-amber-50":"border-green-200 bg-green-50"}`}><p className="text-xs text-gray-500">Available Stock</p><p className={`font-display text-xl font-bold mt-0.5 ${product.stockAvailable===0?"text-red-600":product.stockAvailable<=STOCK_LOW_THRESHOLD?"text-amber-600":"text-green-600"}`}>{product.stockAvailable===0?"OUT":product.stockAvailable}</p><p className="text-xs text-gray-400">{product.stockAvailable===0?"Not available":"units"}</p></div>
        </div>
        <div className="space-y-2">{[{label:"Brand",value:product.brand},{label:"Code / SKU",value:product.sku},{label:"Colors",value:product.colors.join(", ")},{label:"Sizes",value:product.sizes.join(", ")},{label:"Fabric",value:product.fabric},{label:"Rack Location",value:product.rackLocation,highlight:true},{label:"Pattern",value:product.pattern},{label:"Occasions",value:product.occasions.join(", ")},{label:"Remarks",value:product.notes}].filter((d)=>d.value).map((d)=>(<div key={d.label} className="flex items-start gap-3"><span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5">{d.label}</span><span className={`text-sm font-medium flex-1 ${d.highlight?"text-blue-600":"text-gray-800"}`}>{d.value}</span></div>))}</div>
      </DialogContent>
    </Dialog>
  );
}

function ImageSearchDialog({ open, onClose, onResult }: { open:boolean; onClose:()=>void; onResult:(q:string)=>void }) {
  const [phase, setPhase] = useState<"idle"|"scanning"|"done">("idle");
  const fileRef = useState(() => typeof document !== "undefined" ? document.createElement("input") : null)[0];
  const runAI = () => { setPhase("scanning"); setTimeout(()=>setPhase("done"),2000); };
  return (
    <Dialog open={open} onOpenChange={()=>{onClose();setPhase("idle");}}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles size={18} className="text-brand-gold"/> AI Photo Search</DialogTitle><DialogDescription>Take or upload a garment photo to find matching products.</DialogDescription></DialogHeader>
        {phase==="idle"&&(<div className="space-y-4"><div onClick={()=>{if(fileRef){fileRef.type="file";fileRef.accept="image/*";fileRef.capture="environment";fileRef.onchange=()=>runAI();fileRef.click();}}} className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-wine hover:bg-gray-50 p-8 cursor-pointer transition-colors"><Camera size={36} className="text-gray-400"/><div className="text-center"><p className="text-sm font-medium text-gray-700">Take a photo or upload image</p><p className="text-xs text-gray-400 mt-0.5">AI will identify the product</p></div></div></div>)}
        {phase==="scanning"&&(<div className="flex flex-col items-center gap-4 py-8"><div className="relative flex h-16 w-16 items-center justify-center"><div className="absolute inset-0 rounded-full border-4 border-brand-wine border-t-transparent animate-spin"/><Sparkles size={24} className="text-brand-gold"/></div><p className="text-sm font-medium text-gray-700">Analyzing image...</p></div>)}
        {phase==="done"&&(<div className="space-y-4"><div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2"><p className="text-sm font-semibold text-green-800">\u2705 Analysis Complete</p>{[["Detected","Saree"],["Fabric","Silk (94%)"],["Colors","Red, Gold"],["Pattern","Zari"]].map(([k,v])=>(<div key={k} className="flex items-center gap-2 text-xs"><span className="text-gray-500 w-20">{k}:</span><span className="font-medium text-gray-800">{v}</span></div>))}</div><Button className="w-full gap-2" onClick={()=>{onResult("silk saree");onClose();setPhase("idle");}}><Search size={15}/> Show Matching Products</Button></div>)}
      </DialogContent>
    </Dialog>
  );
}

export default function StaffLookupPage() {
  const { products, hydrated } = useProductStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [selected, setSelected] = useState<Product|null>(null);
  const [imgSearch, setImgSearch] = useState(false);

  if (!hydrated) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="text-4xl">\ud83e\uddf5</div>
        <p className="text-sm text-gray-400">Loading products...</p>
      </div>
    </div>
  );

  let filtered = products;
  if (search) { const q=search.toLowerCase(); filtered=filtered.filter((p)=>p.name.toLowerCase().includes(q)||(p.brand??"").toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||p.colors.some((c)=>c.toLowerCase().includes(q))||p.rackLocation.toLowerCase().includes(q)||getCatName(p.categoryId).toLowerCase().includes(q)); }
  if (catFilter) filtered=filtered.filter((p)=>p.categoryId===catFilter);

  return (
    <div className="space-y-4">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">Price Lookup</h1><p className="text-sm text-gray-500">Search products \u00b7 check prices \u00b7 check stock instantly</p></div>
      <div className="flex gap-2">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><Input placeholder="Name, brand, SKU, color, rack..." className="pl-10 h-11 text-base" value={search} onChange={(e)=>setSearch(e.target.value)} autoFocus/>{search&&<button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16}/></button>}</div>
        <Button variant="outline" className="h-11 gap-2 border-brand-gold text-brand-wine shrink-0" onClick={()=>setImgSearch(true)} title="AI Photo Search"><Camera size={18}/><span className="hidden sm:inline text-xs font-medium">AI Photo</span></Button>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={()=>setCatFilter("")} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${!catFilter?"bg-brand-wine text-white border-brand-wine":"border-gray-200 bg-white text-gray-600"}`}>All</button>
        {MOCK_CATEGORIES.map((c)=>(<button key={c.id} onClick={()=>setCatFilter(catFilter===c.id?"":c.id)} className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${catFilter===c.id?"bg-brand-wine text-white border-brand-wine":"border-gray-200 bg-white text-gray-600"}`}>{c.icon} {c.name}</button>))}
      </div>
      <p className="text-xs text-gray-400">{filtered.length} product{filtered.length!==1?"s":""}{search?` for "${search}"`:""}</p>
      {filtered.length===0?(<div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center"><Package size={40} className="mx-auto mb-3 text-gray-300"/><p className="text-sm text-gray-500">No products found</p><button onClick={()=>{setSearch("");setCatFilter("");}} className="mt-2 text-xs text-brand-wine hover:underline">Clear search</button></div>)
        :(<AnimatePresence mode="popLayout"><div className="space-y-2">{filtered.map((p,i)=>(
          <motion.div key={p.id} layout initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:i*0.01}}>
            <button className="w-full text-left" onClick={()=>setSelected(p)}>
              <Card className="hover:shadow-md hover:border-brand-wine/30 transition-all cursor-pointer"><CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-2xl border border-brand-border overflow-hidden">{(p.imageUrls??[]).length>0?<img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover"/>:<span>{getCatIcon(p.categoryId)}</span>}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p><div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-gray-400">{p.brand&&<><span className="font-medium text-gray-600">{p.brand}</span><span>\u00b7</span></>}<span>{getCatName(p.categoryId)}</span>{p.colors.length>0&&<><span>\u00b7</span><span>{p.colors.slice(0,2).join(", ")}</span></>}{p.sku&&<><span>\u00b7</span><span className="font-mono">{p.sku}</span></>}{p.rackLocation&&<><span>\u00b7</span><span className="font-semibold text-blue-600">\ud83d\udccd {p.rackLocation}</span></>}</div></div>
                <div className="shrink-0 text-right"><p className="font-display font-bold text-brand-wine">{formatPrice(p.finalPrice)}</p>{p.discountPct>0&&<p className="text-[10px] text-gray-400 line-through">{formatPrice(p.sellingPrice)}</p>}<p className={`text-[11px] font-bold mt-0.5 ${p.stockAvailable===0?"text-red-600":p.stockAvailable<=STOCK_LOW_THRESHOLD?"text-amber-600":"text-green-600"}`}>{p.stockAvailable===0?"\ud83d\udd34 OUT":p.stockAvailable<=STOCK_LOW_THRESHOLD?`\u26a0\ufe0f ${p.stockAvailable}`:`\u2705 ${p.stockAvailable}`}</p></div>
              </CardContent></Card>
            </button>
          </motion.div>
        ))}</div></AnimatePresence>)}
      {selected&&<ProductSheet product={selected} onClose={()=>setSelected(null)}/>}
      <ImageSearchDialog open={imgSearch} onClose={()=>setImgSearch(false)} onResult={(q)=>setSearch(q)}/>
    </div>
  );
}
