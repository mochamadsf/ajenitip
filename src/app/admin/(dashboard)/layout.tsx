import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

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
    <div className="min-h-screen bg-surface">
      <AdminNav userEmail={userEmail} />

      {/* Main Content — top padding clears the fixed mobile top bar */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
