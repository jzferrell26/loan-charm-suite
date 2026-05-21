import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { groupOfStage, type StageGroup } from "@/lib/mock-data";
import { Avatar } from "@/components/Avatar";
import { StageBadge } from "@/components/StageBadge";
import { currency, timeAgo } from "@/lib/format";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans — Processing Portal" },
      { name: "description", content: "Loan pipeline list" },
    ],
  }),
  component: LoansPage,
});

const TABS = ["All", "Prospect", "Processing", "Closing", "Funded"] as const;
type Tab = (typeof TABS)[number];

function LoansPage() {
  const loans = useStore((s) => s.loans);
  const [tab, setTab] = useState<Tab>("All");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (tab === "All") return loans;
    return loans.filter((l) => groupOfStage(l.stage) === (tab as StageGroup));
  }, [loans, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-card border-b">
        <div className="flex items-center gap-4 px-6 h-14">
          <div className="text-sm font-semibold">All Loans</div>
          <div className="flex items-center rounded-full border bg-card overflow-hidden">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-1.5 text-sm",
                  tab === t
                    ? "bg-blue-50 text-[var(--link)] ring-1 ring-blue-200 rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/loans/new" })}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--link)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Loan
            </button>
            <button className="h-8 w-8 inline-flex items-center justify-center rounded-md border hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-0">
        <div className="bg-card">
          <div className="grid grid-cols-[2fr_1.6fr_0.8fr_1.6fr_1.2fr_1fr_140px] gap-3 px-6 py-2.5 text-xs font-medium text-muted-foreground border-b">
            <div>Borrowers / Loan # / Subject Property</div>
            <div>Loan Status / Trackers</div>
            <div>Tasks Due</div>
            <div>Product / Lender</div>
            <div>Loan Amount</div>
            <div>Last Updated</div>
            <div></div>
          </div>
          <ul>
            {pageRows.map((l) => (
              <li key={l.id}>
                <Link
                  to="/loans/$loanId"
                  params={{ loanId: l.id }}
                  className="grid grid-cols-[2fr_1.6fr_0.8fr_1.6fr_1.2fr_1fr_140px] gap-3 px-6 py-3.5 items-center border-b hover:bg-muted/40 transition-colors text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={l.borrowerName} size={32} />
                    <div className="min-w-0">
                      <div className="text-[var(--link)] font-medium truncate">
                        {l.borrowerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {l.loanNumber}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {l.propertyAddress}, {l.propertyCity}, {l.propertyState}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <StageBadge stage={l.stage} />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tracker on={l.trackers.itp} label="ITP" />
                      <Tracker on={l.trackers.appraisal} label="Appraisal" />
                      <Tracker on={l.trackers.title} label="Title" />
                    </div>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[28px] h-6 rounded-md text-xs font-medium px-2",
                        l.tasksDue > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {l.tasksDue}
                    </span>
                    {l.conditionsPending > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {l.conditionsPending} Conditions
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">{l.propertyType}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {l.lender}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium tabular-nums">
                      {currency(l.loanAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      LTV {l.ltv.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(l.lastUpdated)}
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    Closing {l.closingDate ? new Date(l.closingDate).toLocaleDateString() : "N/A"}
                  </div>
                </Link>
              </li>
            ))}
            {pageRows.length === 0 && (
              <li className="px-6 py-16 text-center text-sm text-muted-foreground">
                No loans in this stage.
              </li>
            )}
          </ul>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground bg-card border-t">
          <div>
            Showing {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
            Results
          </div>
          <div className="flex items-center gap-2">
            <span>Items per page: {pageSize}</span>
            <button
              onClick={() => setPage(1)}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
              disabled={page === 1}
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
              disabled={page === 1}
            >
              ‹
            </button>
            <span className="px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
              disabled={page === totalPages}
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tracker({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full ring-1",
          on
            ? "bg-emerald-500 ring-emerald-600"
            : "bg-transparent ring-muted-foreground/40"
        )}
      />
      {label}
    </span>
  );
}
