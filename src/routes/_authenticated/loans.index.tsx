import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLoans } from "@/lib/loans.functions";
import { StageBadge } from "@/components/StageBadge";
import { Avatar } from "@/components/Avatar";
import { currency, timeAgo } from "@/lib/format";
import { fullName, propertyAddress, STAGE_GROUPS, type Stage } from "@/lib/domain";
import { Button } from "@/components/ui/button";

const TABS = ["All", "Intake", "Processing", "Approvals", "Closing", "Funded"] as const;
type Tab = (typeof TABS)[number];

function isTab(value: unknown): value is Tab {
  return typeof value === "string" && TABS.includes(value as Tab);
}

function isStageGroupTab(value: Tab): value is Exclude<Tab, "All"> {
  return value !== "All";
}



export const Route = createFileRoute("/_authenticated/loans/")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: isTab(s.tab) ? s.tab : "All",
  }),
  component: LoansList,
});

function LoansList() {
  const fn = useServerFn(listLoans);
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: () => fn() });
  const { tab: rawTab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab = isTab(rawTab) ? rawTab : "All";

  const filtered =
    !isStageGroupTab(tab)
      ? loans
      : loans.filter((l) => STAGE_GROUPS[tab].includes(l.stage as Stage));

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Loans</h1>
        <Button asChild>
          <Link to="/loans/new">+ New Loan</Link>
        </Button>
      </div>
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => navigate({ search: { tab: t } })}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === t ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Borrower / Loan # / Property</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-right px-4 py-2.5">Amount / LTV</th>
              <th className="text-right px-4 py-2.5">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((l) => {
              const primary = (l.borrowers ?? []).sort((a, b) => a.borrower_sequence - b.borrower_sequence)[0];
              const name = fullName(primary) || "—";
              const prop = (l.properties ?? [])[0];
              return (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size={32} />
                      <div className="min-w-0">
                        <Link
                          to="/loans/$loanId"
                          params={{ loanId: l.id }}
                          className="font-medium text-[var(--link)] hover:underline"
                        >
                          {name}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate">
                          {l.loan_number} · {propertyAddress(prop) || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={l.stage as Stage} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {l.loan_amount ? currency(Number(l.loan_amount)) : "—"}
                    <div className="text-xs text-muted-foreground">{l.ltv ? `${l.ltv}% LTV` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(l.updated_at)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No loans in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
