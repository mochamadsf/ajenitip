"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatISODateWIB } from "@/lib/time";
import {
  ImagePlus,
  Loader2,
  Save,
  School,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Flame,
  Trash2,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  validateImageFile,
  validateMenuInput,
  type BatchKey,
} from "@/lib/validation";
import { isSupabaseConfigured, DEMO_MENU } from "@/lib/supabase/hooks";
import { PORTIONS } from "@/lib/constants";
import { TimeSelect } from "@/components/admin/time-select";
import {
  MAX_RECIPIENTS_PER_BATCH,
  getRecipientTotal,
  getSchoolNamesSummary,
  normalizeRecipients,
} from "@/lib/beneficiaries";
import {
  NUTRIENT_KEYS,
  type BatchRecipient,
  type NutrientKey,
  type PortionKey,
} from "@/lib/supabase/types";

// Helper to format components string array to multiline string for textarea
const arrToStr = (arr: string[]) => arr.join("\n");
const strToArr = (str: string) =>
  str
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

// ── Tipe & helper form ──────────────────────────────────────────────────
type BatchForm = {
  prod: string;
  delStart: string;
  delEnd: string;
  delivered: boolean;
  /**
   * Daftar penerima (sekolah) batch ini — satu batch boleh beberapa penerima,
   * masing-masing dengan jumlah porsinya sendiri.
   */
  recipients: BatchRecipient[];
};
type BatchesState = Record<BatchKey, BatchForm>;
type NutritionFormState = Record<PortionKey, Record<NutrientKey, string>>;

const EMPTY_BATCH: BatchForm = {
  prod: "",
  delStart: "",
  delEnd: "",
  delivered: false,
  recipients: [],
};

const emptyNutrition = (): NutritionFormState => ({
  balita: { energy: "", protein: "", fat: "", carbs: "", fiber: "" },
  ibu: { energy: "", protein: "", fat: "", carbs: "", fiber: "" },
  tk: { energy: "", protein: "", fat: "", carbs: "", fiber: "" },
  sd: { energy: "", protein: "", fat: "", carbs: "", fiber: "" },
});

// Konfigurasi tampilan kartu batch
const BATCH_META = [
  {
    key: "b1" as BatchKey,
    label: "Batch 1",
    slot: "",
    chip: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    key: "b2" as BatchKey,
    label: "Batch 2",
    slot: "",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "b3" as BatchKey,
    label: "Batch 3",
    slot: "",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
  },
];

/**
 * Daftar penerima satu batch dari baris DB (atau demo) ke bentuk state form.
 * Kolom JSONB `batch{n}_recipients` jadi sumber utama; bila belum ada isinya
 * (data lama), dipakai kolom `batch{n}_school_name` + `batch{n}_beneficiary_count`.
 */
function recipientsFromRecord(
  row: Record<string, unknown> | null,
  n: 1 | 2 | 3,
): BatchRecipient[] {
  const stored = normalizeRecipients(row?.[`batch${n}_recipients`]);
  if (stored.length > 0) return stored;

  const legacySchool =
    (row?.[`batch${n}_school_name`] as string | null | undefined)?.trim() || "";
  const legacyCount =
    (row?.[`batch${n}_beneficiary_count`] as number | null | undefined) || 0;
  if (!legacySchool && legacyCount <= 0) return [];

  return [{ school: legacySchool, count: Math.max(0, legacyCount) }];
}

// Ambil data satu batch dari baris DB (atau demo) ke bentuk state form
function batchFromRecord(
  row: Record<string, unknown> | null,
  n: 1 | 2 | 3,
): BatchForm {
  return {
    prod:
      (
        row?.[`batch${n}_production_time`] as string | null | undefined
      )?.substring(0, 5) || "",
    delStart:
      (
        row?.[`batch${n}_delivery_start`] as string | null | undefined
      )?.substring(0, 5) || "",
    delEnd:
      (row?.[`batch${n}_delivery_end`] as string | null | undefined)?.substring(
        0,
        5,
      ) || "",
    delivered: Boolean(row?.[`batch${n}_delivered`]),
    recipients: recipientsFromRecord(row, n),
  };
}

function batchesFromRecord(row: Record<string, unknown> | null): BatchesState {
  return {
    b1: batchFromRecord(row, 1),
    b2: batchFromRecord(row, 2),
    b3: batchFromRecord(row, 3),
  };
}

// Ambil nilai gizi 4 kategori porsi dari baris DB (atau demo) ke bentuk state form
function nutriFromRecord(
  row: Record<string, unknown> | null,
): NutritionFormState {
  const out = emptyNutrition();
  for (const portion of PORTIONS) {
    for (const n of NUTRIENT_KEYS) {
      const v = row?.[`${n}_${portion.key}`];
      out[portion.key][n] = v == null ? "" : String(v);
    }
  }
  return out;
}

interface BatchEditorProps {
  meta: (typeof BATCH_META)[number];
  value: BatchForm;
  onChange: (patch: Partial<BatchForm>) => void;
}

/**
 * Kartu editor satu batch — satu batch boleh punya beberapa penerima:
 * baris 1: identitas batch + total porsi + tombol tambah penerima,
 * baris 2: daftar penerima (nama sekolah + jumlah porsi),
 * baris 3: jadwal produksi/pengiriman + status kirim.
 */
function BatchEditor({ meta, value, onChange }: BatchEditorProps) {
  const totalPorsi = getRecipientTotal(value.recipients);
  const canAddRecipient = value.recipients.length < MAX_RECIPIENTS_PER_BATCH;

  const updateRecipient = (index: number, patch: Partial<BatchRecipient>) =>
    onChange({
      recipients: value.recipients.map((r, i) =>
        i === index ? { ...r, ...patch } : r,
      ),
    });

  const removeRecipient = (index: number) =>
    onChange({ recipients: value.recipients.filter((_, i) => i !== index) });

  const addRecipient = () =>
    onChange({ recipients: [...value.recipients, { school: "", count: 0 }] });

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3 space-y-3">
      {/* Baris 1: identitas batch + ringkasan porsi + tombol tambah penerima */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold",
            meta.chip,
          )}
        >
          <Truck size={13} />
          {meta.label}
          <span className="font-semibold opacity-60"> {meta.slot}</span>
        </span>

        <span className="text-[11px] font-semibold text-muted-foreground">
          {value.recipients.length} penerima · Σ{" "}
          <span className="font-bold text-foreground tabular-nums">
            {totalPorsi.toLocaleString("id-ID")}
          </span>{" "}
          porsi
        </span>

        <button
          type="button"
          onClick={addRecipient}
          disabled={!canAddRecipient}
          title={
            canAddRecipient
              ? `Tambah penerima di ${meta.label}`
              : `${meta.label} maksimal ${MAX_RECIPIENTS_PER_BATCH} penerima`
          }
          className="sm:ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary-light text-[11px] font-bold text-primary hover:bg-primary/15 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={13} />
          Tambah Penerima
        </button>
      </div>

      {/* Baris 2: daftar penerima — sekolah + jumlah porsi masing-masing */}
      <div className="space-y-2">
        {/* Header kolom, posisinya sejajar dengan input tiap baris */}
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex flex-1 min-w-0 items-center gap-1">
            <School size={11} strokeWidth={2.4} />
            Sekolah Penerima
          </span>
          <span className="flex w-[88px] sm:w-[100px] shrink-0 items-center gap-1">
            <Users size={11} strokeWidth={2.4} />
            Porsi
          </span>
          <span className="w-9 shrink-0" aria-hidden="true" />
        </div>

        {value.recipients.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic">
            Belum ada penerima di {meta.label}. Klik “Tambah Penerima” untuk
            menambahkan sekolah beserta jumlah porsinya.
          </p>
        ) : (
          value.recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={recipient.school}
                onChange={(e) =>
                  updateRecipient(index, { school: e.target.value })
                }
                maxLength={120}
                placeholder="Contoh: SDN Sukaasih 2"
                aria-label={`Sekolah penerima ${index + 1} ${meta.label}`}
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-border bg-white text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />

              <input
                type="number"
                min={0}
                value={recipient.count}
                onChange={(e) =>
                  updateRecipient(index, { count: Number(e.target.value) })
                }
                aria-label={`Jumlah porsi penerima ${index + 1} ${meta.label}`}
                className="w-[88px] sm:w-[100px] shrink-0 px-2.5 py-1.5 rounded-md border border-border bg-white text-sm font-semibold tabular-nums focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => removeRecipient(index)}
                title={`Hapus penerima ${index + 1}`}
                aria-label={`Hapus penerima ${index + 1} pada ${meta.label}`}
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-white text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Baris 3: alur produksi → pengiriman + status kirim */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 pt-3 border-t border-border">
        {/* Selesai produksi */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Selesai Produksi
          </span>
          <TimeSelect
            label={`${meta.label} selesai produksi`}
            value={value.prod}
            onChange={(v) => onChange({ prod: v })}
            className="w-[92px]"
          />
        </div>

        {/* Panah alur produksi → pengiriman */}
        <ArrowRight
          size={14}
          className="text-muted-foreground/70 hidden sm:block mb-2"
        />

        {/* Rentang pengiriman */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Rentang Pengiriman
          </span>
          <div className="flex items-center gap-1.5">
            <TimeSelect
              label={`${meta.label} pengiriman mulai`}
              value={value.delStart}
              onChange={(v) => onChange({ delStart: v })}
              className="w-[92px]"
            />
            <span className="text-xs font-bold text-muted-foreground">–</span>
            <TimeSelect
              label={`${meta.label} pengiriman selesai`}
              value={value.delEnd}
              onChange={(v) => onChange({ delEnd: v })}
              className="w-[92px]"
            />
          </div>
        </div>

        {/* Status kirim */}
        <button
          type="button"
          onClick={() => onChange({ delivered: !value.delivered })}
          className={cn(
            "sm:ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95",
            value.delivered
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-white text-muted-foreground border border-border hover:border-emerald-300 hover:text-emerald-600",
          )}
        >
          <CheckCircle2 size={13} />
          {value.delivered ? "Terkirim" : "Belum Dikirim"}
        </button>
      </div>
    </div>
  );
}

export default function AdminMenuEditorPage() {
  const [date, setDate] = useState(formatISODateWIB(new Date()));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State
  const [id, setId] = useState<string | null>(null);
  const [menuName, setMenuName] = useState("");
  const [components, setComponents] = useState("");
  const [beneficiaries, setBeneficiaries] = useState(0);
  const [safeHours, setSafeHours] = useState(4);
  const [nutritionist, setNutritionist] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Jadwal produksi & rentang pengiriman per batch (format 24 jam)
  const [batches, setBatches] = useState<BatchesState>({
    b1: { ...EMPTY_BATCH },
    b2: { ...EMPTY_BATCH },
    b3: { ...EMPTY_BATCH },
  });

  // Info gizi — 4 kategori porsi
  const [nutrition, setNutrition] =
    useState<NutritionFormState>(emptyNutrition());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateBatch = (key: BatchKey, patch: Partial<BatchForm>) =>
    setBatches((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const updateNutrient = (
    portion: PortionKey,
    nutrient: NutrientKey,
    value: string,
  ) =>
    setNutrition((prev) => ({
      ...prev,
      [portion]: { ...prev[portion], [nutrient]: value },
    }));

  // Terapkan data menu (dari Supabase / demo) ke form, atau reset jika null
  const applyMenu = useCallback((row: Record<string, unknown> | null) => {
    setId(row ? ((row.id as string) ?? null) : null);
    setMenuName(row ? (row.menu_name as string) || "" : "");
    setComponents(row ? arrToStr((row.menu_components as string[]) || []) : "");
    setBeneficiaries(row ? (row.beneficiary_count as number) || 0 : 0);
    setSafeHours(row ? (row.safe_hours as number) || 4 : 4);
    setNutritionist(row ? (row.nutritionist_name as string) || "" : "");
    setPhotoUrl(row ? ((row.photo_url as string | null) ?? null) : null);
    setBatches(batchesFromRecord(row));
    setNutrition(nutriFromRecord(row));
  }, []);

  const fetchMenu = useCallback(
    async (selectedDate: string) => {
      setLoading(true);
      setMessage(null);

      // If Supabase credentials are not configured, load demo menu or empty form
      if (!isSupabaseConfigured()) {
        applyMenu(
          selectedDate === formatISODateWIB(new Date())
            ? (DEMO_MENU as unknown as Record<string, unknown>)
            : null,
        );
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
          applyMenu(data as unknown as Record<string, unknown>);
        } else {
          // Reset form for new entry
          applyMenu(null);
        }
      } catch (e: unknown) {
        const err = e as Error;
        const errMsg =
          err.message === "Failed to fetch"
            ? "Koneksi ke Supabase gagal (Failed to fetch). Silakan restart server Next.js (npm run dev) jika baru mengubah .env.local, atau periksa jaringan internet."
            : "Gagal memuat data: " + err.message;
        setMessage({ type: "error", text: errMsg });
      } finally {
        setLoading(false);
      }
    },
    [applyMenu],
  );

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

    // Guard: pastikan Supabase sudah dikonfigurasi sebelum mencoba upload
    if (!isSupabaseConfigured()) {
      setMessage({
        type: "error",
        text: "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local, lalu restart server.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

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
      const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
      const fileName = `${date}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("menu-photos")
        .getPublicUrl(fileName);
      if (!data?.publicUrl) throw new Error("URL publik gambar tidak tersedia");

      setPhotoUrl(data.publicUrl);
      setMessage({
        type: "success",
        text: 'Foto berhasil diunggah ke Storage. Klik "Simpan Menu" agar tersimpan permanen.',
      });
    } catch (e: unknown) {
      const err = e as Error;
      const raw = err.message || "";
      let text = "Gagal upload gambar: " + raw;

      // Pesan yang lebih membantu untuk penyebab yang paling sering terjadi
      if (/bucket/i.test(raw) && /(not|doesn.?t|does not)/i.test(raw)) {
        text =
          'Gagal upload: bucket "menu-photos" belum ada di Supabase. Buka Dashboard → Storage → New bucket → nama "menu-photos" → centang "Public bucket", lalu jalankan supabase/storage-setup.sql di SQL Editor.';
      } else if (
        /row-level security|rls|unauthorized|forbidden|403/i.test(raw)
      ) {
        text =
          "Gagal upload: ditolak kebijakan Storage (RLS). Pastikan Anda login sebagai admin dan jalankan supabase/storage-setup.sql di SQL Editor Supabase untuk membuat policy upload.";
      } else if (/mime/i.test(raw)) {
        text =
          "Gagal upload: tipe file tidak diizinkan bucket. Gunakan JPG, PNG, atau WebP.";
      } else if (/fetch|network|failed/i.test(raw)) {
        text =
          "Gagal upload: tidak bisa terhubung ke Supabase. Periksa NEXT_PUBLIC_SUPABASE_URL di .env.local dan koneksi internet Anda.";
      }
      setMessage({ type: "error", text });
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
      batches,
      nutrition,
    });

    if (!validation.valid) {
      setMessage({ type: "error", text: validation.errors.join(" • ") });
      setSaving(false);
      return;
    }

    // Susun payload nilai gizi untuk 4 kategori porsi
    const nutritionPayload: Record<string, number | null> = {};
    for (const portion of PORTIONS) {
      for (const n of NUTRIENT_KEYS) {
        const v = nutrition[portion.key][n];
        nutritionPayload[`${n}_${portion.key}`] = v ? parseFloat(v) : null;
      }
    }

    // Susun penerima tiap batch: rapikan nama sekolah & buang baris kosong,
    // lalu sinkronkan kolom lama (school_name + beneficiary_count) agar data
    // lama/consumer lain tetap membaca nilai yang benar.
    const batchRecipients = (key: BatchKey) => {
      const rows = normalizeRecipients(batches[key].recipients);
      return {
        rows,
        schoolName: getSchoolNamesSummary(rows),
        total: getRecipientTotal(rows),
      };
    };
    const b1 = batchRecipients("b1");
    const b2 = batchRecipients("b2");
    const b3 = batchRecipients("b3");

    const payload = {
      menu_date: date,
      menu_name: menuName.trim(),
      menu_components: parsedComponents,
      photo_url: photoUrl,
      beneficiary_count: beneficiaries,
      safe_hours: safeHours,
      nutritionist_name: nutritionist.trim() || null,

      batch1_production_time: batches.b1.prod || null,
      batch1_delivery_start: batches.b1.delStart || null,
      batch1_delivery_end: batches.b1.delEnd || null,
      batch1_delivered: batches.b1.delivered,
      batch1_recipients: b1.rows,
      batch1_school_name: b1.schoolName,
      batch1_beneficiary_count: b1.total,

      batch2_production_time: batches.b2.prod || null,
      batch2_delivery_start: batches.b2.delStart || null,
      batch2_delivery_end: batches.b2.delEnd || null,
      batch2_delivered: batches.b2.delivered,
      batch2_recipients: b2.rows,
      batch2_school_name: b2.schoolName,
      batch2_beneficiary_count: b2.total,

      batch3_production_time: batches.b3.prod || null,
      batch3_delivery_start: batches.b3.delStart || null,
      batch3_delivery_end: batches.b3.delEnd || null,
      batch3_delivered: batches.b3.delivered,
      batch3_recipients: b3.rows,
      batch3_school_name: b3.schoolName,
      batch3_beneficiary_count: b3.total,

      ...nutritionPayload,
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

  // Total porsi & jumlah sekolah dari rincian penerima Batch 1–3
  // (pembanding untuk kolom "Jumlah Penerima")
  const batchRecipientRows = [
    batches.b1.recipients,
    batches.b2.recipients,
    batches.b3.recipients,
  ];
  const batchPorsiTotal = batchRecipientRows.reduce(
    (sum, rows) => sum + getRecipientTotal(rows),
    0,
  );
  const batchSchoolTotal = batchRecipientRows.reduce(
    (sum, rows) => sum + normalizeRecipients(rows).length,
    0,
  );
  const totalMatchesBatches = batchPorsiTotal === beneficiaries;

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
              : "bg-red-50 text-red-700 border-red-200",
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
        <form
          onSubmit={handleSave}
          className="space-y-6 animate-slide-up stagger-1"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Upload */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">
                Foto Menu
              </h3>
              <div className="relative aspect-[4/3] bg-surface rounded-xl overflow-hidden border border-dashed border-border flex flex-col items-center justify-center group">
                {photoUrl ? (
                  <>
                    <Image
                      src={photoUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
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
                    <ImagePlus
                      size={32}
                      strokeWidth={1.5}
                      className="text-muted-foreground mx-auto mb-2"
                    />
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload foto ompreng (Max 5MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
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
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Nama Menu
                </label>
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
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Komponen (Pisahkan baris)
                </label>
                <textarea
                  value={components}
                  onChange={(e) => setComponents(e.target.value)}
                  rows={5}
                  placeholder="Nasi Putih&#10;Ayam Geprek&#10;Sayur Bayam"
                  className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium resize-none"
                />
              </div>
            </div>

            {/* Penerima & Keamanan Pangan */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Users size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Penerima & Keamanan
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Masa Aman (Jam)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={safeHours}
                    onChange={(e) => setSafeHours(Number(e.target.value))}
                    required
                    className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Jumlah Penerima
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(Number(e.target.value))}
                    required
                    className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary"
                  />
                  {batchPorsiTotal > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          totalMatchesBatches
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        Σ Batch 1–3: {batchPorsiTotal.toLocaleString("id-ID")}{" "}
                        porsi
                        {batchSchoolTotal > 0
                          ? ` · ${batchSchoolTotal} sekolah`
                          : ""}
                      </span>
                      {!totalMatchesBatches && (
                        <button
                          type="button"
                          onClick={() => setBeneficiaries(batchPorsiTotal)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Samakan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Daftar sekolah (bisa lebih dari satu) &amp; jumlah porsi tiap
                batch diisi pada bagian{" "}
                <span className="font-semibold text-foreground">
                  Jadwal, Sekolah &amp; Pengiriman
                </span>{" "}
                di bawah.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Ahli Gizi Bertugas
                </label>
                <input
                  type="text"
                  value={nutritionist}
                  onChange={(e) => setNutritionist(e.target.value)}
                  placeholder="Nama lengkap & gelar"
                  className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-medium focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Jadwal, Sekolah & Pengiriman — kartu horizontal per batch */}
          <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Jadwal, Sekolah & Pengiriman
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Satu batch bisa diisi beberapa sekolah penerima
              </span>
            </div>

            <div className="space-y-3">
              <BatchEditor
                meta={BATCH_META[0]}
                value={batches.b1}
                onChange={(patch) => updateBatch("b1", patch)}
              />

              <BatchEditor
                meta={BATCH_META[1]}
                value={batches.b2}
                onChange={(patch) => updateBatch("b2", patch)}
              />

              <BatchEditor
                meta={BATCH_META[2]}
                value={batches.b3}
                onChange={(patch) => updateBatch("b3", patch)}
              />
            </div>
          </section>

          {/* Informasi Nilai Gizi — 4 Kategori Porsi */}
          <section className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Informasi Nilai Gizi
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                4 kategori porsi sesuai standar MBG
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {PORTIONS.map((portion) => {
                const PortionIcon = portion.icon;
                return (
                  <div
                    key={portion.key}
                    className="rounded-xl border border-border overflow-hidden bg-white hover:shadow-sm transition-shadow"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5",
                        portion.chip,
                      )}
                    >
                      <PortionIcon size={18} strokeWidth={2.2} />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                          {portion.group}
                        </p>
                        <p className="text-xs font-bold leading-tight truncate">
                          {portion.title}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 space-y-2.5 bg-surface/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Energi (kkal)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={nutrition[portion.key].energy}
                          onChange={(e) =>
                            updateNutrient(
                              portion.key,
                              "energy",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-md border border-border text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ["protein", "Protein (g)"],
                            ["fat", "Lemak (g)"],
                            ["carbs", "Karbo (g)"],
                            ["fiber", "Serat (g)"],
                          ] as Array<[NutrientKey, string]>
                        ).map(([n, label]) => (
                          <div key={n} className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              {label}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={nutrition[portion.key][n]}
                              onChange={(e) =>
                                updateNutrient(portion.key, n, e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-md border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed ml-auto"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {id ? "Update Menu" : "Simpan Menu"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
