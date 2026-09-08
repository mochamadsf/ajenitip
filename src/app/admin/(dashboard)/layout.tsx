import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, LayoutDashboard, UtensilsCrossed, UserCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co";

  let userEmail: string | null = isDemo ? "admin@sppg.id (Demo)" : null;

  if (!isDemo) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser?.email) {
      userEmail = authUser.email;
    }
  }

  if (!userEmail) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-border fixed inset-y-0 left-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <span className="font-bold text-sm">A</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Panel Admin</p>
              <p className="text-[10px] text-muted-foreground">SPPG Dapur</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/admin/menu"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <UtensilsCrossed size={18} />
            Kelola Menu
          </Link>
          <div className="pt-4 mt-4 border-t border-border">
             <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              Lihat Website
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
             <UserCircle size={24} className="text-muted-foreground" />
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate">{userEmail}</p>
             </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full mt-2 flex items-center gap-2 justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
              <LogOut size={14} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
