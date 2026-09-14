import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { formatISODateWIB } from "@/lib/time";

/**
 * Returns true if valid Supabase credentials are present in the environment.
 * This is the same logic as isSupabaseConfigured() in hooks.ts but
 * usable server-side without importing a "use client" module.
 */
function isSupabaseConfiguredServer(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    url !== "https://your-project.supabase.co" &&
    !!key &&
    key !== "your-anon-key-here"
  );
}

/**
 * Next.js signals "this route cannot be prerendered because it uses a
 * Request-time API" by throwing an error whose `digest` is
 * `DYNAMIC_SERVER_USAGE` (see https://nextjs.org/docs/messages/dynamic-server-error).
 *
 * `createClient()` reads cookies through `@supabase/ssr`, so this route is
 * dynamic. That control-flow error must never be swallowed by a `try/catch`,
 * otherwise the build reports a bogus database failure.
 */
function isDynamicServerUsageError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    (err as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

export default async function AdminDashboardPage() {
  const configured = isSupabaseConfiguredServer();
  const today = formatISODateWIB(new Date());

  let todayMenu: { menu_name: string; beneficiary_count: number } | null = null;
  let dbConnected = false;

  if (configured) {
    try {
      const supabase = await createClient();

      // Verify real DB connectivity
      const { data: pingData, error: pingError } = await supabase
        .from("kitchen_config")
        .select("id")
        .limit(1);

      console.log("[Admin] DB ping - error:", pingError, "data:", pingData);

      if (!pingError) {
        dbConnected = true;

        // Fetch today's menu stats only if connected
        const { data } = await supabase
          .from("daily_menus")
          .select("menu_name, beneficiary_count")
          .eq("menu_date", today)
          .single();

        todayMenu = data;
      }
    } catch (err) {
      // Re-throw Next.js' dynamic-rendering bailout signal (see helper above).
      if (isDynamicServerUsageError(err)) throw err;
      console.error("[Admin] DB connection error:", err);
      dbConnected = false;
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Selamat datang, Admin
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${
                dbConnected ? "bg-emerald-400" : "bg-red-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                dbConnected ? "bg-emerald-500" : "bg-red-500"
              }`}
            ></span>
          </span>
          {dbConnected
            ? "Database Terhubung"
            : configured
            ? "Database Gagal Terhubung"
            : "Database Tidak Terhubung (Mode Demo)"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up stagger-1">
        {/* Quick Action: Menu Today */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <UtensilsCrossed size={20} strokeWidth={2} className="text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-foreground mb-1">
            Menu Hari Ini
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {todayMenu
              ? `Sudah diatur: ${todayMenu.menu_name}`
              : "Belum ada menu yang diatur."}
          </p>
          <Link
            href="/admin/menu"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-surface text-foreground font-semibold text-xs rounded-lg border border-border hover:bg-surface-hover transition-colors"
          >
            Kelola Menu
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <ShieldCheck size={20} strokeWidth={2} className="text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-foreground mb-1">
            Panduan Admin
          </h2>
          <ul className="text-xs text-muted-foreground space-y-2 mt-3 list-disc pl-4">
            <li>Pastikan mengunggah foto ompreng yang jelas.</li>
            <li>Jam produksi &amp; pengiriman sangat penting untuk countdown Food Safety.</li>
            <li>Isi informasi gizi porsi kecil &amp; besar dengan akurat.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
