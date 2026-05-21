import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Bell, HelpCircle, Plus } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/loans", label: "Loans" },
  { to: "/borrowers", label: "Borrowers" },
  { to: "/contacts", label: "Contacts" },
];

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(to + "/");
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
                isActive(it.to) && "text-white"
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
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
            <input
              placeholder="Search"
              className="h-8 w-64 rounded-md bg-white/10 pl-8 pr-3 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/15"
            />
          </div>
          <button className="h-8 w-8 rounded-md hover:bg-white/10 inline-flex items-center justify-center">
            <HelpCircle className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-md hover:bg-white/10 inline-flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-md hover:bg-white/10 inline-flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </button>
          <Avatar name="Admin User" size={28} className="ml-1" />
        </div>
      </div>
    </header>
  );
}
