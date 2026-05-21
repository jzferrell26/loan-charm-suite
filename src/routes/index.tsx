import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { STAGE_GROUPS, type StageGroup } from "@/lib/mock-data";
import { Avatar } from "@/components/Avatar";
import { compactCurrency, currency, timeAgo } from "@/lib/format";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Processing Portal" },
      { name: "description", content: "Loan pipeline overview" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const loans = useStore((s) => s.loans);
  const activeLoans = loans.filter((l) => l.stage !== "Funded");
  const totalVolume = loans.reduce((sum, l) => sum + l.loanAmount, 0);
  const conditionsPending = loans.reduce((s, l) => s + l.conditionsPending, 0);
  const thisMonth = new Date();
  const closingThisMonth = loans.filter((l) => {
    if (!l.closingDate) return false;
    const d = new Date(l.closingDate);
    return (
      d.getMonth() === thisMonth.getMonth() &&
      d.getFullYear() === thisMonth.getFullYear()
    );
  }).length;

  const stats = [
    { label: "Active Loans", value: activeLoans.length },
    { label: "Total Loan Volume", value: compactCurrency(totalVolume) },
    { label: "Conditions Pending", value: conditionsPending },
    { label: "Closing This Month", value: closingThisMonth },
  ];

  // Pipeline grouped data
  const groups = (Object.keys(STAGE_GROUPS) as StageGroup[]).filter(
    (g) => g !== "Funded"
  );

  const maxVolume = Math.max(
    1,
    ...loans.map((l) => l.loanAmount)
  );

  const recentLoans = [...loans]
    .sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated))
    .slice(0, 7);

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-medium text-foreground">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-md border p-4"
          >
            <div className="text-2xl font-semibold text-[var(--link)]">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Pipeline */}
        <section className="lg:col-span-2 bg-card rounded-md border">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pipeline Status</h2>
            <span className="text-xs text-muted-foreground">YTD</span>
          </div>
          <div className="p-4 space-y-5">
            {groups.map((group) => {
              const stages = STAGE_GROUPS[group];
              return (
                <div key={group}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {group}
                  </div>
                  <div className="space-y-1.5">
                    {stages.map((st) => {
                      const inStage = loans.filter((l) => l.stage === st);
                      const vol = inStage.reduce((s, l) => s + l.loanAmount, 0);
                      const w = Math.min(100, (vol / maxVolume) * 100);
                      return (
                        <div
                          key={st}
                          className="grid grid-cols-[1fr_40px_80px_1fr] items-center gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-[var(--link)] hover:underline cursor-default">
                              {st}
                            </span>
                          </div>
                          <div className="text-right tabular-nums">
                            {inStage.length}
                          </div>
                          <div className="text-right tabular-nums text-muted-foreground">
                            {compactCurrency(vol)}
                          </div>
                          <div className="h-2 bg-muted rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${w}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent loans */}
        <section className="bg-card rounded-md border">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Loans</h2>
          </div>
          <ul className="divide-y">
            {recentLoans.map((l) => (
              <li key={l.id}>
                <Link
                  to="/loans/$loanId"
                  params={{ loanId: l.id }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
                >
                  <Avatar name={l.borrowerName} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--link)] truncate">
                        {l.borrowerName}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(l.lastUpdated)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {l.propertyType} · {currency(l.loanAmount)}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
