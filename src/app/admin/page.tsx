import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { formatISODateWIB } from "@/lib/time";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = formatISODateWIB(new Date());

  // Fetch today's menu stats
  const { data: todayMenu } = await supabase
    .from("daily_menus")
    .select("menu_name, beneficiary_count")
    .eq("menu_date", today)
    .single();

  // Determine DB connection status by running a simple query
  let dbConnected = false;
  try {
    const { error } = await supabase.from("kitchen_config").select("id").limit(1);
    dbConnected = !error;
  } catch {
    dbConnected = false;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Selamat datang, Admin
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2">
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
          {dbConnected ? "Database Terhubung" : "Database Tidak Terhubung (Mode Demo)"}
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
              : "Belum ada menu yang diatur untuk hari ini."}
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
            <li>Jam produksi & pengiriman sangat penting untuk countdown Food Safety.</li>
            <li>Isi informasi gizi porsi kecil & besar dengan akurat.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
