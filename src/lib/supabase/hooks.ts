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
  batch1_delivery_time: "07:30",
  batch2_production_time: "10:30:00",
  batch2_delivery_time: "11:00:00",
  batch1_delivered: true,
  batch2_delivered: false,
  batch3_production_time: "15:00:00",
  batch3_delivery_time: "15:30:00",
  batch3_delivered: false,
  safe_hours: 4,
  beneficiary_count: 350,
  nutritionist_name: "Ns. Siti Aminah, S.Gz",
  energy_small: 450,
  protein_small: 18,
  fat_small: 15,
  carbs_small: 60,
  fiber_small: 5,
  energy_large: 650,
  protein_large: 28,
  fat_large: 22,
  carbs_large: 85,
  fiber_large: 7,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_KITCHEN_CONFIG: KitchenConfig = {
  id: "demo-config",
  kitchen_name: "Dapur SPPG Aje",
  instagram_url: "https://instagram.com/dapursppg",
  tiktok_url: "https://tiktok.com/@dapursppg",
  updated_at: new Date().toISOString(),
};

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
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
        const today = formatISODateWIB(new Date());
        const { data, error: err } = await supabase
          .from("daily_menus")
          .select("*")
          .eq("menu_date", today)
          .single();

        if (err) {
          if (err.code === "PGRST116") {
            setMenu(null); // No menu for today
          } else {
            setError(err.message);
          }
        } else {
          setMenu(data as DailyMenu);
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
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setMenu(null);
      return;
    }

    async function fetch() {
      setLoading(true);
      if (!isSupabaseConfigured()) {
        if (date === formatISODateWIB(new Date())) {
          setMenu(DEMO_MENU);
        } else {
          setMenu(null);
        }
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .from("daily_menus")
          .select("*")
          .eq("menu_date", date)
          .single();

        if (err) {
          if (err.code === "PGRST116") setMenu(null);
          else setError(err.message);
        } else {
          setMenu(data as DailyMenu);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [date]);

  return { menu, loading, error };
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
        .order("menu_date", { ascending: false })
        .limit(30);

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

  useEffect(() => {
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
