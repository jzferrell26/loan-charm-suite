import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLoans } from "@/lib/loans.functions";
import { Avatar } from "@/components/Avatar";
import { fullName } from "@/lib/domain";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/borrowers")({
  component: BorrowersList,
});

function BorrowersList() {
  const fn = useServerFn(listLoans);
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: () => fn() });
  const borrowers = loans.flatMap((l) =>
    (l.borrowers ?? []).map((b) => ({ ...b, loan_id: l.id, loan_number: l.loan_number, loan_updated: l.updated_at })),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Borrowers</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Email</th>
              <th className="text-left px-4 py-2.5">Phone</th>
              <th className="text-left px-4 py-2.5">Loan</th>
              <th className="text-right px-4 py-2.5">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {borrowers.map((b) => {
              const name = fullName(b);
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size={28} />
                      <Link
                        to="/loans/$loanId"
                        params={{ loanId: b.loan_id }}
                        className="font-medium text-[var(--link)] hover:underline"
                      >
                        {name || "—"}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">{b.email ?? "—"}</td>
                  <td className="px-4 py-3">{b.phone ?? "—"}</td>
                  <td className="px-4 py-3">{b.loan_number ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(b.loan_updated)}</td>
                </tr>
              );
            })}
            {borrowers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No borrowers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
