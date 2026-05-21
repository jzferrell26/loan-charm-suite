import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/mock-data";
import { Avatar } from "@/components/Avatar";
import { StageBadge } from "@/components/StageBadge";
import { currency, formatDate, timeAgo } from "@/lib/format";
import { toast } from "sonner";
import { ChevronLeft, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/loans/$loanId")({
  head: () => ({ meta: [{ title: "Loan Detail — Processing Portal" }] }),
  component: DealDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Loan not found. <Link to="/loans" className="text-[var(--link)]">Back to loans</Link>
    </div>
  ),
});

type TabKey = "overview" | "notes" | "documents";

function DealDetail() {
  const { loanId } = Route.useParams();
  const loan = useStore((s) => s.loans.find((l) => l.id === loanId));
  const updateStage = useStore((s) => s.updateLoanStage);
  const addNote = useStore((s) => s.addNote);
  const addDocument = useStore((s) => s.addDocument);
  const [tab, setTab] = useState<TabKey>("overview");
  const [noteText, setNoteText] = useState("");

  if (!loan) throw notFound();

  const handleStage = (newStage: Stage) => {
    updateStage(loan.id, newStage);
    toast.success(`Stage updated to ${newStage}`, {
      description: "Webhook fired to n8n.",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="px-6 pt-4 pb-3">
          <Link
            to="/loans"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="h-3 w-3" /> Loans
          </Link>
          <div className="flex items-start gap-4">
            <Avatar name={loan.borrowerName} size={44} />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold">{loan.borrowerName}</h1>
              <div className="text-xs text-muted-foreground">
                Loan #{loan.loanNumber} · {loan.propertyAddress},{" "}
                {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <StageBadge stage={loan.stage} />
                <span className="text-xs text-muted-foreground">
                  Last updated {timeAgo(loan.lastUpdated)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Stage</label>
              <select
                value={loan.stage}
                onChange={(e) => handleStage(e.target.value as Stage)}
                className="h-8 rounded-md border bg-card px-2 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => toast.message("Term sheet generation coming soon.")}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--link)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                <FileText className="h-4 w-4" /> Generate Term Sheet
              </button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-6 flex items-center gap-1">
          {(["overview", "notes", "documents"] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px",
                tab === t
                  ? "border-[var(--link)] text-[var(--link)]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
              {t === "notes" && loan.notes.length > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({loan.notes.length})
                </span>
              )}
              {t === "documents" && loan.documents.length > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({loan.documents.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <InfoCard title="Borrower Info">
              <Row label="First Name" value={loan.borrowerName.split(" ")[0]} />
              <Row
                label="Last Name"
                value={loan.borrowerName.split(" ").slice(1).join(" ")}
              />
              <Row label="Email" value={emailFor(loan.borrowerName)} />
              <Row label="Phone" value="(404) 555-0123" />
              <Row label="SSN" value="•••-••-1234" />
            </InfoCard>
            <InfoCard title="Property Info">
              <Row label="Address" value={loan.propertyAddress} />
              <Row label="City" value={loan.propertyCity} />
              <Row label="State" value={loan.propertyState} />
              <Row label="Zip" value={loan.propertyZip} />
              <Row label="Property Type" value={loan.propertyType} />
              <Row label="Purchase Price" value={currency(loan.purchasePrice)} />
              <Row label="ARV" value={currency(loan.arv)} />
            </InfoCard>
            <InfoCard title="Loan Terms">
              <Row label="Loan Amount" value={currency(loan.loanAmount)} />
              <Row label="Interest Rate" value={`${loan.interestRate}%`} />
              <Row label="LTV" value={`${loan.ltv.toFixed(1)}%`} />
              <Row label="Term" value={`${loan.termMonths} months`} />
              <Row label="Points" value={String(loan.points)} />
              <Row label="Origination Fee" value={currency(loan.originationFee)} />
              <Row label="Maturity Date" value={formatDate(loan.maturityDate)} />
              <Row label="Lender" value={loan.lender} />
            </InfoCard>
          </div>
        )}

        {tab === "notes" && (
          <div className="max-w-3xl bg-card border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold">Internal Notes</h3>
            </div>
            <ul className="divide-y max-h-[420px] overflow-auto">
              {loan.notes.length === 0 && (
                <li className="p-6 text-sm text-muted-foreground text-center">
                  No notes yet.
                </li>
              )}
              {[...loan.notes].reverse().map((n) => (
                <li key={n.id} className="p-4 flex gap-3">
                  <Avatar name={n.author} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{n.author}</span> ·{" "}
                      {timeAgo(n.ts)}
                    </div>
                    <div className="text-sm mt-0.5 whitespace-pre-wrap">{n.body}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                className="flex-1 min-h-[60px] rounded-md border px-3 py-2 text-sm resize-y"
              />
              <button
                onClick={() => {
                  if (!noteText.trim()) return;
                  addNote(loan.id, noteText.trim());
                  setNoteText("");
                  toast.success("Note added");
                }}
                className="self-end rounded-md bg-[var(--link)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="max-w-3xl space-y-4">
            <div
              onClick={() => {
                const name = `Document_${Date.now()}.pdf`;
                addDocument(loan.id, name);
                toast.success("Document uploaded (mock)");
              }}
              className="border-2 border-dashed rounded-md p-10 text-center bg-card hover:bg-muted/30 cursor-pointer"
            >
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG — mock storage only
              </p>
            </div>
            <div className="bg-card border rounded-md">
              <div className="p-3 border-b text-sm font-semibold">Uploaded Documents</div>
              {loan.documents.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No documents uploaded yet.
                </div>
              ) : (
                <ul className="divide-y">
                  {loan.documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {d.name}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(d.uploadedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-md">
      <div className="px-4 py-3 border-b text-sm font-semibold">{title}</div>
      <dl className="p-4 space-y-2">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function emailFor(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
}
