import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Bell, HelpCircle, Plus, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/loans", label: "Loans" },
  { to: "/borrowers", label: "Borrowers" },
  { to: "/contacts", label: "Contacts" },
];

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userLabel, setUserLabel] = useState("User");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email;
      if (email) setUserLabel(email.split("@")[0] ?? email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const email = session?.user.email;
      setUserLabel(email ? (email.split("@")[0] ?? email) : "User");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(to + "/");

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate({ to: "/loans", search: { tab: "All", q } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <header className="bg-[var(--nav)] text-[var(--nav-foreground)]">
      <div className="flex h-14 items-center gap-1 px-4">
        <Link to="/" className="mr-4 flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-base">Processing Portal</span>
        </Link>
        <nav className="flex items-center">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "px-4 py-4 text-sm font-medium text-white/80 hover:text-white transition-colors relative",
                isActive(it.to) && "text-white",
              )}
            >
              {it.label}
              {isActive(it.to) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={onSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loans…"
              className="h-8 w-64 rounded-md bg-white/10 pl-8 pr-3 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/15"
            />
          </form>
          <button
            type="button"
            title="Help"
            className="h-8 w-8 rounded-md hover:bg-white/10 inline-flex items-center justify-center"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Notifications"
            className="h-8 w-8 rounded-md hover:bg-white/10 inline-flex items-center justify-center"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/loans/new" title="New loan">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full ml-1 focus:outline-none focus:ring-2 focus:ring-white/40">
                <Avatar name={userLabel} size={28} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {userLabel}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
