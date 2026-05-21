import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLoan, updateLoanStage, addNote } from "@/lib/loans.functions";
import { StageBadge } from "@/components/StageBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { STAGES, STAGE_LABELS, fullName, propertyAddress, type Stage } from "@/lib/domain";
import { currency, formatDate, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/loans/$loanId")({
  component: LoanDetail,
});

function LoanDetail() {
  const { loanId } = Route.useParams();
  const getFn = useServerFn(getLoan);
  const stageFn = useServerFn(updateLoanStage);
  const noteFn = useServerFn(addNote);
  const qc = useQueryClient();

  const { data: loan } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => getFn({ data: { id: loanId } }),
  });

  const [note, setNote] = useState("");

  if (!loan) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const primary = (loan.borrowers ?? []).sort((a, b) => a.borrower_sequence - b.borrower_sequence)[0];
  const prop = (loan.properties ?? [])[0];
  const notes = (loan.notes ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));

  async function changeStage(s: Stage) {
    try {
      await stageFn({ data: { id: loanId, new_stage: s } });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Stage updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function submitNote() {
    if (!note.trim()) return;
    try {
      await noteFn({ data: { loan_id: loanId, note_text: note.trim() } });
      setNote("");
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
      toast.success("Note added");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/loans" search={{ tab: "All" }} className="text-xs text-muted-foreground hover:underline">← Loans</Link>
          <h1 className="text-xl font-semibold">{fullName(primary) || "Untitled"} <span className="text-muted-foreground font-normal">· {loan.loan_number}</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={loan.stage}
            onChange={(e) => changeStage(e.target.value as Stage)}
            className="h-9 rounded-md border bg-white px-3 text-sm"
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
          <StageBadge stage={loan.stage as Stage} />
          <Button variant="outline">Generate Term Sheet</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card title={`Borrowers (${loan.borrowers?.length ?? 0})`}>
              {(loan.borrowers ?? []).sort((a, b) => a.borrower_sequence - b.borrower_sequence).map((b) => (
                <div key={b.id} className="py-2 border-b last:border-0">
                  <div className="font-medium">{fullName(b) || "—"} <span className="text-xs text-muted-foreground">#{b.borrower_sequence}</span></div>
                  <div className="text-xs text-muted-foreground">{b.email} · {b.phone}</div>
                </div>
              ))}
            </Card>
            <Card title="Property">
              <div className="text-sm">{propertyAddress(prop) || "—"}</div>
              <div className="text-xs text-muted-foreground mt-1">{prop?.property_type} · {prop?.property_usage}</div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <KV k="Purchase" v={prop?.purchase_price ? currency(Number(prop.purchase_price)) : "—"} />
                <KV k="ARV" v={prop?.arv ? currency(Number(prop.arv)) : "—"} />
              </div>
            </Card>
          </div>
          <Card title="Loan Terms">
            <div className="grid grid-cols-4 gap-3 text-sm">
              <KV k="Purpose" v={loan.loan_purpose ?? "—"} />
              <KV k="Type" v={loan.loan_type ?? "—"} />
              <KV k="Amount" v={loan.loan_amount ? currency(Number(loan.loan_amount)) : "—"} />
              <KV k="Rate" v={loan.interest_rate ? `${loan.interest_rate}%` : "—"} />
              <KV k="LTV" v={loan.ltv ? `${loan.ltv}%` : "—"} />
              <KV k="Term" v={loan.loan_term_months ? `${loan.loan_term_months} mo` : "—"} />
              <KV k="Points" v={loan.points ?? "—"} />
              <KV k="Maturity" v={loan.maturity_date ? formatDate(loan.maturity_date) : "—"} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card title="Notes">
            <div className="flex gap-2 mb-4">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
              <Button onClick={submitNote}>Add</Button>
            </div>
            <div className="divide-y">
              {notes.map((n) => (
                <div key={n.id} className="py-3">
                  <div className="text-xs text-muted-foreground">{n.created_by} · {timeAgo(n.created_at)}</div>
                  <div className="text-sm mt-0.5 whitespace-pre-wrap">{n.note_text}</div>
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-muted-foreground py-4">No notes yet.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card title="Documents">
            <div className="border-2 border-dashed rounded-md p-8 text-center text-sm text-muted-foreground">
              Drop files here (upload coming soon)
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="tabular-nums">{v}</div>
    </div>
  );
}
