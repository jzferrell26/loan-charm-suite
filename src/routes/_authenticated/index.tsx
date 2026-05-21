import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLoans } from "@/lib/loans.functions";
import { StageBadge } from "@/components/StageBadge";
import { Avatar } from "@/components/Avatar";
import { currency, timeAgo } from "@/lib/format";
import { STAGES, STAGE_LABELS, fullName, type Stage } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(listLoans);
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: () => fn() });

  const active = loans.filter((l) => l.stage !== "FUNDED").length;
  const volume = loans.reduce((s, l) => s + (Number(l.loan_amount) || 0), 0);
  const closingThisMonth = loans.filter((l) => {
    if (!l.maturity_date) return false;
    const d = new Date(l.maturity_date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const byStage = STAGES.map((s) => {
    const list = loans.filter((l) => l.stage === s);
    return {
      stage: s,
      count: list.length,
      volume: list.reduce((acc, l) => acc + (Number(l.loan_amount) || 0), 0),
    };
  });
  const maxCount = Math.max(1, ...byStage.map((b) => b.count));

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Active Loans" value={active} />
        <Stat label="Total Loan Volume" value={currency(volume)} />
        <Stat label="Conditions Pending" value={loans.filter((l) => l.stage === "APPROVED_WITH_CONDITIONS").length} />
        <Stat label="Closing This Month" value={closingThisMonth} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-3">Pipeline Status</h2>
          <div className="space-y-2">
            {byStage.map((b) => (
              <div key={b.stage} className="flex items-center gap-3 text-sm">
                <div className="w-44 truncate">{STAGE_LABELS[b.stage as Stage]}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded">
                  <div className="h-2 rounded bg-blue-500" style={{ width: `${(b.count / maxCount) * 100}%` }} />
                </div>
                <div className="w-10 text-right tabular-nums">{b.count}</div>
                <div className="w-24 text-right text-muted-foreground tabular-nums">{currency(b.volume)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-3">Recent Loans</h2>
          <div className="divide-y">
            {loans.slice(0, 8).map((l) => {
              const primary = (l.borrowers ?? []).sort((a, b) => a.borrower_sequence - b.borrower_sequence)[0];
              const name = fullName(primary) || "—";
              return (
                <div key={l.id} className="flex items-center gap-3 py-2 text-sm">
                  <Avatar name={name} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.loan_type ?? ""}</div>
                  </div>
                  <StageBadge stage={l.stage as Stage} />
                  <div className="w-20 text-right text-xs text-muted-foreground">{timeAgo(l.updated_at)}</div>
                </div>
              );
            })}
            {loans.length === 0 && <p className="text-sm text-muted-foreground py-4">No loans yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
