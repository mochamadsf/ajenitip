"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatISODateWIB } from "@/lib/time";
import { ImagePlus, Loader2, Save, Plus, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { validateImageFile, validateMenuInput } from "@/lib/validation";
import { isSupabaseConfigured, DEMO_MENU } from "@/lib/supabase/hooks";

// Helper to format components string array to multiline string for textarea
const arrToStr = (arr: string[]) => arr.join("\n");
const strToArr = (str: string) =>
  str
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export default function AdminMenuEditorPage() {
  const [date, setDate] = useState(formatISODateWIB(new Date()));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [id, setId] = useState<string | null>(null);
  const [menuName, setMenuName] = useState("");
  const [components, setComponents] = useState("");
  const [beneficiaries, setBeneficiaries] = useState(0);
  const [safeHours, setSafeHours] = useState(4);
  const [nutritionist, setNutritionist] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Batch 1
  const [b1Prod, setB1Prod] = useState("");
  const [b1Del, setB1Del] = useState("");
  const [b1Delivered, setB1Delivered] = useState(false);
  // Batch 2
  const [b2Prod, setB2Prod] = useState("");
  const [b2Del, setB2Del] = useState("");
  const [b2Delivered, setB2Delivered] = useState(false);
  // Batch 3
  const [b3Prod, setB3Prod] = useState("");
  const [b3Del, setB3Del] = useState("");
  const [b3Delivered, setB3Delivered] = useState(false);

  // Nutrition (Small)
  const [eSmall, setESmall] = useState("");
  const [pSmall, setPSmall] = useState("");
  const [fSmall, setFSmall] = useState("");
  const [cSmall, setCSmall] = useState("");
  const [fiSmall, setFiSmall] = useState("");

  // Nutrition (Large)
  const [eLarge, setELarge] = useState("");
  const [pLarge, setPLarge] = useState("");
  const [fLarge, setFLarge] = useState("");
  const [cLarge, setCLarge] = useState("");
  const [fiLarge, setFiLarge] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchMenu = useCallback(async (selectedDate: string) => {
    setLoading(true);
    setMessage(null);

    // If Supabase credentials are not configured, load demo menu or empty form
    if (!isSupabaseConfigured()) {
      if (selectedDate === formatISODateWIB(new Date())) {
        setId(DEMO_MENU.id);
        setMenuName(DEMO_MENU.menu_name);
        setComponents(arrToStr(DEMO_MENU.menu_components));
        setBeneficiaries(DEMO_MENU.beneficiary_count);
        setSafeHours(DEMO_MENU.safe_hours);
        setNutritionist(DEMO_MENU.nutritionist_name || "");
        setPhotoUrl(DEMO_MENU.photo_url);
        setB1Prod(DEMO_MENU.batch1_production_time || "");
        setB1Del(DEMO_MENU.batch1_delivery_time || "");
        setB1Delivered(DEMO_MENU.batch1_delivered || false);
        setB2Prod(DEMO_MENU.batch2_production_time || "");
        setB2Del(DEMO_MENU.batch2_delivery_time || "");
        setB2Delivered(DEMO_MENU.batch2_delivered || false);
        setB3Prod(DEMO_MENU.batch3_production_time || "");
        setB3Del(DEMO_MENU.batch3_delivery_time || "");
        setB3Delivered(DEMO_MENU.batch3_delivered || false);
        setESmall(DEMO_MENU.energy_small?.toString() || "");
        setPSmall(DEMO_MENU.protein_small?.toString() || "");
        setFSmall(DEMO_MENU.fat_small?.toString() || "");
        setCSmall(DEMO_MENU.carbs_small?.toString() || "");
        setFiSmall(DEMO_MENU.fiber_small?.toString() || "");
        setELarge(DEMO_MENU.energy_large?.toString() || "");
        setPLarge(DEMO_MENU.protein_large?.toString() || "");
        setFLarge(DEMO_MENU.fat_large?.toString() || "");
        setCLarge(DEMO_MENU.carbs_large?.toString() || "");
        setFiLarge(DEMO_MENU.fiber_large?.toString() || "");
      } else {
        setId(null);
        setMenuName(""); setComponents(""); setPhotoUrl(null);
        setB1Prod(""); setB1Del(""); setB1Delivered(false);
        setB2Prod(""); setB2Del(""); setB2Delivered(false);
        setB3Prod(""); setB3Del(""); setB3Delivered(false);
        setESmall(""); setPSmall(""); setFSmall(""); setCSmall(""); setFiSmall("");
        setELarge(""); setPLarge(""); setFLarge(""); setCLarge(""); setFiLarge("");
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("menu_date", selectedDate)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setId(data.id);
        setMenuName(data.menu_name || "");
        setComponents(arrToStr(data.menu_components || []));
        setBeneficiaries(data.beneficiary_count || 0);
        setSafeHours(data.safe_hours || 4);
        setNutritionist(data.nutritionist_name || "");
        setPhotoUrl(data.photo_url);
        
        setB1Prod(data.batch1_production_time?.substring(0, 5) || "");
        setB1Del(data.batch1_delivery_time?.substring(0, 5) || "");
        setB1Delivered(data.batch1_delivered || false);
        
        setB2Prod(data.batch2_production_time?.substring(0, 5) || "");
        setB2Del(data.batch2_delivery_time?.substring(0, 5) || "");
        setB2Delivered(data.batch2_delivered || false);

        setB3Prod(data.batch3_production_time?.substring(0, 5) || "");
        setB3Del(data.batch3_delivery_time?.substring(0, 5) || "");
        setB3Delivered(data.batch3_delivered || false);

        setESmall(data.energy_small?.toString() || "");
        setPSmall(data.protein_small?.toString() || "");
        setFSmall(data.fat_small?.toString() || "");
        setCSmall(data.carbs_small?.toString() || "");
        setFiSmall(data.fiber_small?.toString() || "");

        setELarge(data.energy_large?.toString() || "");
        setPLarge(data.protein_large?.toString() || "");
        setFLarge(data.fat_large?.toString() || "");
        setCLarge(data.carbs_large?.toString() || "");
        setFiLarge(data.fiber_large?.toString() || "");
      } else {
        // Reset form for new entry
        setId(null);
        setMenuName("");
        setComponents("");
        setPhotoUrl(null);
        setB1Prod("");
        setB1Del("");
        setB1Delivered(false);
        setB2Prod("");
        setB2Del("");
        setB2Delivered(false);
        setB3Prod("");
        setB3Del("");
        setB3Delivered(false);
        setESmall(""); setPSmall(""); setFSmall(""); setCSmall(""); setFiSmall("");
        setELarge(""); setPLarge(""); setFLarge(""); setCLarge(""); setFiLarge("");
      }
    } catch (e: unknown) {
      const err = e as Error;
      const errMsg = err.message === "Failed to fetch"
        ? "Koneksi ke Supabase gagal (Failed to fetch). Silakan restart server Next.js (npm run dev) jika baru mengubah .env.local, atau periksa jaringan internet."
        : "Gagal memuat data: " + err.message;
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!ignore) {
        await fetchMenu(date);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [date, fetchMenu]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const imageValidation = validateImageFile(file);
    if (!imageValidation.valid) {
      setMessage({ type: "error", text: imageValidation.errors.join(" ") });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${date}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('menu-photos')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
    } catch (e: unknown) {
      const err = e as Error;
      setMessage({ type: "error", text: "Gagal upload gambar: " + err.message });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const parsedComponents = strToArr(components);

    // Validate input fields
    const validation = validateMenuInput({
      menuName: menuName.trim(),
      components: parsedComponents,
      beneficiaries,
      safeHours,
      nutritionist: nutritionist.trim(),
      b1Prod, b1Del,
      b2Prod, b2Del,
      b3Prod, b3Del,
      eSmall, pSmall, fSmall, cSmall, fiSmall,
      eLarge, pLarge, fLarge, cLarge, fiLarge,
    });

    if (!validation.valid) {
      setMessage({ type: "error", text: validation.errors.join(" • ") });
      setSaving(false);
      return;
    }

    const payload = {
      menu_date: date,
      menu_name: menuName.trim(),
      menu_components: parsedComponents,
      photo_url: photoUrl,
      beneficiary_count: beneficiaries,
      safe_hours: safeHours,
      nutritionist_name: nutritionist.trim() || null,
      
      batch1_production_time: b1Prod || null,
      batch1_delivery_time: b1Del || null,
      batch1_delivered: b1Delivered,
      
      batch2_production_time: b2Prod || null,
      batch2_delivery_time: b2Del || null,
      batch2_delivered: b2Delivered,

      batch3_production_time: b3Prod || null,
      batch3_delivery_time: b3Del || null,
      batch3_delivered: b3Delivered,

      energy_small: eSmall ? parseFloat(eSmall) : null,
      protein_small: pSmall ? parseFloat(pSmall) : null,
      fat_small: fSmall ? parseFloat(fSmall) : null,
      carbs_small: cSmall ? parseFloat(cSmall) : null,
      fiber_small: fiSmall ? parseFloat(fiSmall) : null,

      energy_large: eLarge ? parseFloat(eLarge) : null,
      protein_large: pLarge ? parseFloat(pLarge) : null,
      fat_large: fLarge ? parseFloat(fLarge) : null,
      carbs_large: cLarge ? parseFloat(cLarge) : null,
      fiber_large: fiLarge ? parseFloat(fiLarge) : null,
    };

    try {
      if (id) {
        const { error } = await supabase
          .from("daily_menus")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("daily_menus")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data) setId(data.id);
      }
      setMessage({ type: "success", text: "Menu berhasil disimpan!" });
    } catch (e: unknown) {
      const err = e as Error;
      setMessage({ type: "error", text: "Gagal menyimpan: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Kelola Menu
          </h1>
          <p className="text-sm text-muted-foreground">
            Tambah atau perbarui data menu harian, jadwal, dan info gizi.
          </p>
        </div>
        
        {/* Date Picker top right */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-border">
          <Calendar size={18} className="text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm font-bold text-foreground focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "p-4 rounded-xl text-sm font-medium border animate-slide-up",
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          )}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-border">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 animate-slide-up stagger-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Image & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Photo Upload */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Foto Menu</h3>
                <div className="relative aspect-[4/3] bg-surface rounded-xl overflow-hidden border border-dashed border-border flex flex-col items-center justify-center group">
                  {photoUrl ? (
                    <>
                      <Image src={photoUrl} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-foreground flex items-center gap-2"
                        >
                          <ImagePlus size={14} /> Ganti Foto
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImagePlus size={32} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-3">Upload foto ompreng (Max 5MB)</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Pilih Gambar
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Basic Details */}
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Nama Menu</label>
                  <input
                    type="text"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                    placeholder="Contoh: Nasi Ayam Geprek..."
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Komponen (Pisahkan baris)</label>
                  <textarea
                    value={components}
                    onChange={(e) => setComponents(e.target.value)}
                    rows={5}
                    placeholder="Nasi Putih&#10;Ayam Geprek&#10;Sayur Bayam"
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Middle Column: Schedule & Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <Clock size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Jadwal & Produksi</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 1 Produksi</label>
                    <input type="time" value={b1Prod} onChange={(e) => setB1Prod(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 1 Pengiriman</label>
                    <input type="time" value={b1Del} onChange={(e) => setB1Del(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="b1del" checked={b1Delivered} onChange={(e) => setB1Delivered(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    <label htmlFor="b1del" className="text-xs font-medium text-foreground">Tandai Batch 1 Sudah Dikirim</label>
                  </div>
                </div>

                <div className="w-full h-px bg-border my-2" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 2 Produksi</label>
                    <input type="time" value={b2Prod} onChange={(e) => setB2Prod(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 2 Pengiriman</label>
                    <input type="time" value={b2Del} onChange={(e) => setB2Del(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="b2del" checked={b2Delivered} onChange={(e) => setB2Delivered(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    <label htmlFor="b2del" className="text-xs font-medium text-foreground">Tandai Batch 2 Sudah Dikirim</label>
                  </div>
                </div>

                <div className="w-full h-px bg-border my-2" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 3 Produksi</label>
                    <input type="time" value={b3Prod} onChange={(e) => setB3Prod(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Batch 3 Pengiriman</label>
                    <input type="time" value={b3Del} onChange={(e) => setB3Del(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="b3del" checked={b3Delivered} onChange={(e) => setB3Delivered(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    <label htmlFor="b3del" className="text-xs font-medium text-foreground">Tandai Batch 3 Sudah Dikirim</label>
                  </div>
                </div>

                <div className="w-full h-px bg-border my-2" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Masa Aman (Jam)</label>
                    <input type="number" min={1} value={safeHours} onChange={(e) => setSafeHours(Number(e.target.value))} required className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Jumlah Penerima</label>
                    <input type="number" min={0} value={beneficiaries} onChange={(e) => setBeneficiaries(Number(e.target.value))} required className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Ahli Gizi Bertugas</label>
                  <input type="text" value={nutritionist} onChange={(e) => setNutritionist(e.target.value)} placeholder="Nama lengkap & gelar" className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Right Column: Nutrition */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">Info Gizi (Porsi Kecil)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Energi (kkal)</label>
                    <input type="number" step="0.1" value={eSmall} onChange={(e) => setESmall(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Protein (g)</label>
                    <input type="number" step="0.1" value={pSmall} onChange={(e) => setPSmall(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Lemak (g)</label>
                    <input type="number" step="0.1" value={fSmall} onChange={(e) => setFSmall(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Karbo (g)</label>
                    <input type="number" step="0.1" value={cSmall} onChange={(e) => setCSmall(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Serat (g)</label>
                    <input type="number" step="0.1" value={fiSmall} onChange={(e) => setFiSmall(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">Info Gizi (Porsi Besar)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Energi (kkal)</label>
                    <input type="number" step="0.1" value={eLarge} onChange={(e) => setELarge(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Protein (g)</label>
                    <input type="number" step="0.1" value={pLarge} onChange={(e) => setPLarge(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Lemak (g)</label>
                    <input type="number" step="0.1" value={fLarge} onChange={(e) => setFLarge(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Karbo (g)</label>
                    <input type="number" step="0.1" value={cLarge} onChange={(e) => setCLarge(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Serat (g)</label>
                    <input type="number" step="0.1" value={fiLarge} onChange={(e) => setFiLarge(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary" />
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed ml-auto"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {id ? "Update Menu" : "Simpan Menu"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
