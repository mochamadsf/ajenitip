"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DailyMenu, KitchenConfig } from "@/lib/supabase/types";
import { formatISODateWIB } from "@/lib/time";

// ── Demo / fallback data when Supabase is not configured ──
export const DEMO_MENU: DailyMenu = {
  id: "demo-1",
  menu_date: formatISODateWIB(new Date()),
  menu_name: "Nasi Ayam Geprek dengan Sambal Matah",
  menu_components: [
    "Nasi Putih",
    "Ayam Geprek Sambal Matah",
    "Sayur Bayam Bening",
    "Tempe Goreng",
    "Kerupuk",
    "Buah Jeruk",
  ],
  photo_url: null,
  batch1_production_time: "05:00",
  batch1_delivery_start: "07:00",
  batch1_delivery_end: "08:00",
  batch1_delivered: true,
  // Satu batch boleh beberapa penerima (sekolah)
  batch1_recipients: [
    { school: "SDN Sukaasih 2", count: 90 },
    { school: "SD Al-Hikmah", count: 60 },
  ],
  batch1_school_name: "SDN Sukaasih 2, SD Al-Hikmah",
  batch1_beneficiary_count: 150,
  batch2_production_time: "10:30",
  batch2_delivery_start: "11:00",
  batch2_delivery_end: "12:00",
  batch2_delivered: false,
  batch2_recipients: [{ school: "SMPN 12 Bandung", count: 120 }],
  batch2_school_name: "SMPN 12 Bandung",
  batch2_beneficiary_count: 120,
  batch3_production_time: "15:00",
  batch3_delivery_start: "15:30",
  batch3_delivery_end: "16:30",
  batch3_delivered: false,
  batch3_recipients: [
    { school: "TK Tunas Harapan", count: 50 },
    { school: "PAUD Melati", count: 30 },
  ],
  batch3_school_name: "TK Tunas Harapan, PAUD Melati",
  batch3_beneficiary_count: 80,
  safe_hours: 4,
  beneficiary_count: 350,
  nutritionist_name: "Ns. Siti Aminah, S.Gz",
  energy_balita: 450,
  protein_balita: 18,
  fat_balita: 15,
  carbs_balita: 60,
  fiber_balita: 5,
  energy_ibu: 700,
  protein_ibu: 30,
  fat_ibu: 25,
  carbs_ibu: 90,
  fiber_ibu: 8,
  energy_tk: 350,
  protein_tk: 15,
  fat_tk: 12,
  carbs_tk: 45,
  fiber_tk: 4,
  energy_sd: 650,
  protein_sd: 28,
  fat_sd: 22,
  carbs_sd: 85,
  fiber_sd: 7,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_KITCHEN_CONFIG: KitchenConfig = {
  id: "demo-config",
  kitchen_name: "Dapur SPPG Kota Bandung Bojongloa Kaler Suka Asih 2",
  instagram_url: "https://instagram.com/dapursppg",
  tiktok_url: "https://tiktok.com/@dapursppg",
  updated_at: new Date().toISOString(),
};

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://your-project.supabase.co" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key-here"
  );
}

// ── Hooks ──

export function useTodayMenu() {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!isSupabaseConfigured()) {
        setMenu(DEMO_MENU);
        setLoading(false);
        return;
      }
      try {
        // Tampilkan menu terbaru yang tersedia. Bila ada menu untuk hari ini,
        // baris itulah yang terambil (urut menurun berdasarkan tanggal);
        // bila belum ada, menu terakhir tetap ditampilkan — sehingga tidak ada
        // lagi empty-state "belum ada data".
        const { data, error: err } = await supabase
          .from("daily_menus")
          .select("*")
          .order("menu_date", { ascending: false })
          .limit(1);

        if (err) {
          setError(err.message);
        } else {
          const latest = (data as DailyMenu[] | null)?.[0];
          setMenu(latest ?? null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { menu, loading, error };
}

export function useMenuByDate(date: string | null) {
  // The fetched row is stored together with the date it belongs to, so the value
  // returned during render is always derived from the requested `date`. This
  // avoids having to clear state from inside the effect when `date` is null.
  const [result, setResult] = useState<{
    date: string;
    menu: DailyMenu | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    const requestedDate = date;
    // Responses for a superseded date must not overwrite the newer one.
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured()) {
        setResult({
          date: requestedDate,
          menu:
            requestedDate === formatISODateWIB(new Date()) ? DEMO_MENU : null,
        });
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .from("daily_menus")
          .select("*")
          .eq("menu_date", requestedDate)
          .single();

        if (cancelled) return;

        if (err) {
          if (err.code === "PGRST116") {
            // Tidak ada menu untuk tanggal ini → tampilkan menu terbaru yang
            // tersedia agar data tidak tersembunyi di balik empty-state.
            const { data: latest } = await supabase
              .from("daily_menus")
              .select("*")
              .order("menu_date", { ascending: false })
              .limit(1);

            if (!cancelled) {
              setResult({
                date: requestedDate,
                menu: (latest as DailyMenu[] | null)?.[0] ?? null,
              });
            }
          } else {
            setError(err.message);
          }
        } else {
          setResult({ date: requestedDate, menu: data as DailyMenu });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();

    return () => {
      cancelled = true;
    };
  }, [date]);

  return {
    menu: date && result?.date === date ? result.menu : null,
    loading: date ? loading : false,
    error,
  };
}

export function useMenuHistory() {
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setMenus([DEMO_MENU]);
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from("daily_menus")
        .select("*")
        .order("menu_date", { ascending: false });

      if (err) setError(err.message);
      else setMenus((data as DailyMenu[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByDate = useCallback(async (date: string) => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      if (date === formatISODateWIB(new Date())) {
        setMenus([DEMO_MENU]);
      } else {
        setMenus([]);
      }
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("menu_date", date);

      if (err) setError(err.message);
      else setMenus((data as DailyMenu[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount: subscribing to the external data source (Supabase).
  // `fetchAll()` sets `loading` synchronously before awaiting the request, which
  // the rule flags in general but is a no-op render here because `loading`
  // already starts as `true`.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; loading already starts true
    fetchAll();
  }, [fetchAll]);

  return { menus, loading, error, fetchAll, fetchByDate };
}

export function useKitchenConfig() {
  const [config, setConfig] = useState<KitchenConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!isSupabaseConfigured()) {
        setConfig(DEMO_KITCHEN_CONFIG);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("kitchen_config")
          .select("*")
          .limit(1)
          .single();

        if (data) setConfig(data as KitchenConfig);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { config, loading };
}
