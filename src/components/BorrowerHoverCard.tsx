import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar } from "./Avatar";
import type { LoanBorrower } from "@/lib/mock-data";
import { Mail, Phone, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function BorrowerHoverCard({
  loanNumber,
  borrowers,
  children,
}: {
  loanNumber: string;
  borrowers: LoanBorrower[];
  children: React.ReactNode;
}) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[460px] p-0"
        onClick={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-sm">
            <span className="font-semibold">Borrowers</span>
            <span className="ml-3 text-muted-foreground">Loan #{loanNumber}</span>
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--link)] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Invite Borrower
          </button>
        </div>
        <div className="border-t">
          {borrowers.map((b, i) => (
            <div
              key={b.borrowerId + i}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                i > 0 && "border-t"
              )}
            >
              <Avatar name={b.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium truncate">{b.name}</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded",
                      b.role === "Primary"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {b.role}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {b.pending && (
                    <span className="text-orange-500 leading-none">•</span>
                  )}
                  {b.status}
                </div>
              </div>
              <div className="min-w-0 text-xs">
                <div className="text-foreground truncate">{b.email || "—"}</div>
                <div className="text-muted-foreground flex items-center gap-1">
                  {b.phone || "Phone number not found"}
                  {b.phone && <span className="text-emerald-600">📞</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn disabled={!b.email}>
                  <Mail className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn disabled={!b.phone}>
                  <Phone className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn disabled={!b.phone}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 text-[11px] text-muted-foreground italic border-t flex items-center gap-1">
          <span className="text-orange-500">•</span>
          Indicates something is pending from borrower's end
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function IconBtn({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => e.preventDefault()}
      className={cn(
        "h-7 w-7 inline-flex items-center justify-center rounded border",
        disabled
          ? "text-muted-foreground/40 border-border/60"
          : "text-[var(--link)] border-border hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
