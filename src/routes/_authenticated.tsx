import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  ),
});
