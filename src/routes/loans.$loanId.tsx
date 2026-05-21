import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/mock-data";
import { StageBadge } from "@/components/StageBadge";
import { currency } from "@/lib/format";
import { toast } from "sonner";
import {
  ChevronLeft,
  Printer,
  RefreshCw,
  MessageSquare,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  CircleAlert,
  CircleCheck,
  Circle,
  Info,
  Eye,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/loans/$loanId")({
  head: () => ({ meta: [{ title: "Loan Detail — Processing Portal" }] }),
  component: DealDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Loan not found.{" "}
      <Link to="/loans" className="text-[var(--link)]">
        Back to loans
      </Link>
    </div>
  ),
});

type SubTab = "loan" | "property" | "title";
type SideKey =
  | "loan-property"
  | "borrower-info"
  | "financial-info"
  | "products-pricing"
  | "review-fees"
  | "dual-aus"
  | "pre-approval";

function DealDetail() {
  const { loanId } = Route.useParams();
  const loan = useStore((s) => s.loans.find((l) => l.id === loanId));
  const updateStage = useStore((s) => s.updateLoanStage);
  const addNote = useStore((s) => s.addNote);
  const addDocument = useStore((s) => s.addDocument);

  const [tab, setTab] = useState<SubTab>("loan");
  const [side, setSide] = useState<SideKey>("loan-property");
  const [activeView, setActiveView] = useState<"overview" | "notes" | "documents">("overview");
  const [noteText, setNoteText] = useState("");

  // Editable financial state — autocalculates across fields
  const [purchasePrice, setPurchasePrice] = useState(loan?.purchasePrice ?? 0);
  const [appraisedValue, setAppraisedValue] = useState(loan?.arv ?? loan?.purchasePrice ?? 0);
  const [baseLoanAmount, setBaseLoanAmount] = useState(loan?.loanAmount ?? 0);
  const [noteRate, setNoteRate] = useState(loan?.interestRate ?? 0);
  const [termMonths, setTermMonths] = useState(loan?.termMonths ?? 360);

  if (!loan) throw notFound();

  const primary = loan.borrowers[0];
  const fico = 660;
  const dti = "0.00% / 0.00%";
  const downPayment = Math.max(0, purchasePrice - baseLoanAmount);
  const downPct = purchasePrice ? (downPayment / purchasePrice) * 100 : 0;
  const ltv = appraisedValue ? (baseLoanAmount / appraisedValue) * 100 : 0;
  const ftc = Math.round(baseLoanAmount * 0.067);

  const proposed = useMemo(() => {
    const r = noteRate / 100 / 12;
    const n = termMonths || 360;
    const p = baseLoanAmount;
    const m = r === 0 ? p / n : (p * r) / (1 - Math.pow(1 + r, -n));
    return Math.round(m * 100) / 100;
  }, [noteRate, termMonths, baseLoanAmount]);

  const onDownPaymentChange = (v: number) =>
    setBaseLoanAmount(Math.max(0, purchasePrice - v));
  const onLtvChange = (v: number) => {
    if (!appraisedValue) return;
    setBaseLoanAmount(Math.round((v / 100) * appraisedValue));
  };

  const handleStage = (newStage: Stage) => {
    updateStage(loan.id, newStage);
    toast.success(`Stage updated to ${newStage}`, {
      description: "Webhook fired to n8n.",
    });
  };

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      {/* Top strip: loan # / breadcrumb / metrics */}
      <div className="bg-card border-b">
        <div className="flex items-center gap-4 px-4 h-14">
          <Link
            to="/loans"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border hover:bg-muted text-muted-foreground"
            aria-label="Back to loans"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="text-sm font-semibold tabular-nums">{loan.loanNumber}</div>

          {/* Stage breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <StageBadge stage={loan.stage} />
            <span className="text-muted-foreground">›</span>
            <span className="inline-flex items-center gap-1 text-foreground">
              <span className="h-2 w-2 rotate-45 bg-blue-500 inline-block" />
              App Intake
            </span>
            <div className="ml-2 flex items-center gap-0.5">
              <div className="h-1.5 w-20 rounded-full bg-emerald-500" />
              <div className="h-1.5 w-12 rounded-full bg-muted" />
              <div className="h-1.5 w-12 rounded-full bg-muted" />
              <span className="ml-1 text-muted-foreground">→</span>
            </div>
          </div>

          {/* Metric blocks */}
          <div className="ml-2 flex items-center divide-x">
            <Metric
              label="Loan Amount · LTV"
              value={
                <>
                  {currency(baseLoanAmount)}.00 ·{" "}
                  <span className="font-normal">{ltv.toFixed(2)}%</span>
                </>
              }
            />
            <Metric label="FICO" value={String(fico)} />
            <Metric
              label="Rate"
              value={
                <span className="inline-flex items-center gap-1">
                  <span className="text-orange-500">🔒</span>
                  {noteRate.toFixed(3)}%
                </span>
              }
            />
            <Metric label="DTI" value={dti} />
            <Metric label="FTC" value={`${currency(ftc)}.00`} />
            <Metric label="Est Closing" value="--" />

          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <IconChip aria-label="Refresh" onClick={() => toast.message("Refreshed")}>
              <RefreshCw className="h-3.5 w-3.5" />
            </IconChip>
            <IconChip aria-label="Chat">
              <MessageSquare className="h-3.5 w-3.5" />
            </IconChip>
            <IconChip aria-label="More">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </IconChip>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 bg-card border-r min-h-[calc(100vh-7rem)] px-3 py-4">
          <div className="px-2">
            <div className="text-xs text-muted-foreground">Purchase</div>
            <div className="mt-1 flex items-start gap-1">
              <div className="font-semibold text-sm leading-snug">
                {loan.borrowerName}
              </div>
              {loan.borrowers.length > 1 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  +{loan.borrowers.length - 1}
                </span>
              )}
            </div>
            <button className="mt-1 text-xs font-medium text-[var(--link)] hover:underline">
              Invite Borrower
            </button>
            <div className="mt-2 flex items-center gap-1.5">
              <SidebarIconBtn title={primary?.email}>
                <Mail className="h-3.5 w-3.5" />
              </SidebarIconBtn>
              <SidebarIconBtn title={primary?.phone}>
                <Phone className="h-3.5 w-3.5" />
              </SidebarIconBtn>
              <SidebarIconBtn>
                <MessageSquare className="h-3.5 w-3.5" />
              </SidebarIconBtn>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {loan.propertyState} {loan.propertyZip}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground space-y-0.5">
              <div>Primary Residence</div>
              <div>{loan.propertyType} Detached</div>
            </div>
          </div>

          <nav className="mt-5 space-y-0.5">
            <SideItem
              icon={<CircleAlert className="h-3.5 w-3.5 text-orange-500" />}
              label="Loan & Property"
              active={side === "loan-property"}
              onClick={() => setSide("loan-property")}
            />
            <SideItem
              icon={<CircleAlert className="h-3.5 w-3.5 text-orange-500" />}
              label="Borrower Info"
              onClick={() => setSide("borrower-info")}
              active={side === "borrower-info"}
            />
            <SideItem
              icon={<CircleCheck className="h-3.5 w-3.5 text-emerald-500" />}
              label="Financial Info"
              onClick={() => setSide("financial-info")}
              active={side === "financial-info"}
            />
            <div className="pt-3" />
            <SideItem
              icon={<CircleCheck className="h-3.5 w-3.5 text-emerald-500" />}
              label="Products & Pricing"
              onClick={() => setSide("products-pricing")}
              active={side === "products-pricing"}
            />
            <SideItem
              icon={<Circle className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Review Fees"
              onClick={() => setSide("review-fees")}
              active={side === "review-fees"}
            />
            <SideItem
              icon={<CircleAlert className="h-3.5 w-3.5 text-orange-500" />}
              label="Dual AUS"
              onClick={() => setSide("dual-aus")}
              active={side === "dual-aus"}
            />
            <SideItem
              icon={<Circle className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Pre-Approval"
              onClick={() => setSide("pre-approval")}
              active={side === "pre-approval"}
            />
          </nav>

          <div className="mt-5 pt-4 border-t space-y-0.5">
            <SideCount
              label="Loan Center"
              count={null}
              active={activeView === "overview" && side === "loan-property"}
              onClick={() => setActiveView("overview")}
            />
            <SideCount label="Client Needs" count="0/6" />
            <SideCount label="Conditions" count="0/0" />
            <SideCount
              label="Documents"
              count={String(loan.documents.length || 16)}
              onClick={() => setActiveView("documents")}
              active={activeView === "documents"}
            />
            <SideCount label="Disclosure Forms" count={null} />
            <SideCount label="Loan Quotes" count={null} />
            <SideCount label="Funding / Revenue" count={null} />
            <SideCount label="Audit & Dates" count={null} />
            <SideCount
              label="Notes"
              count={loan.notes.length || null}
              onClick={() => setActiveView("notes")}
              active={activeView === "notes"}
            />
          </div>

          {/* Stage selector (keeps webhook live) */}
          <div className="mt-5 pt-4 border-t px-1">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Stage
            </label>
            <select
              value={loan.stage}
              onChange={(e) => handleStage(e.target.value as Stage)}
              className="mt-1 w-full h-8 rounded-md border bg-card px-2 text-xs"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4">
          <div className="bg-card border rounded-md">
            {activeView === "overview" && (
              <>
                {/* Page title */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-end gap-3">
                    <h1 className="text-xl font-semibold">Loan & Property Info</h1>
                    <span className="text-sm text-muted-foreground underline underline-offset-4 decoration-dotted pb-0.5">
                      Conforming
                    </span>
                  </div>
                  <button
                    onClick={() => toast.message("Print 1003 — mock only")}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-[var(--link)] border-[var(--link)]/30 hover:bg-blue-50"
                  >
                    <Printer className="h-4 w-4" /> Print 1003
                  </button>
                </div>

                {/* Sub tabs */}
                <div className="px-6 border-b flex items-center gap-6">
                  <SubTabBtn
                    active={tab === "loan"}
                    onClick={() => setTab("loan")}
                    error
                  >
                    Loan Info
                  </SubTabBtn>
                  <SubTabBtn
                    active={tab === "property"}
                    onClick={() => setTab("property")}
                    error
                  >
                    Property Info
                  </SubTabBtn>
                  <SubTabBtn
                    active={tab === "title"}
                    onClick={() => setTab("title")}
                  >
                    Title Info
                  </SubTabBtn>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 p-6">
                  <div className="min-w-0">
                    {tab === "loan" && (
                      <LoanInfoForm
                        purchasePrice={purchasePrice}
                        appraisedValue={appraisedValue}
                        baseLoanAmount={baseLoanAmount}
                        noteRate={noteRate}
                        termMonths={termMonths}
                        downPayment={downPayment}
                        downPct={downPct}
                        ltv={ltv}
                        onPurchasePriceChange={setPurchasePrice}
                        onAppraisedValueChange={setAppraisedValue}
                        onBaseLoanChange={setBaseLoanAmount}
                        onDownPaymentChange={onDownPaymentChange}
                        onLtvChange={onLtvChange}
                        onNoteRateChange={setNoteRate}
                        onTermChange={setTermMonths}
                      />
                    )}
                    {tab === "property" && <PropertyInfoForm loan={loan} />}
                    {tab === "title" && <TitleInfoForm />}
                  </div>
                  <div className="space-y-5">
                    <ProposedPayment monthly={proposed} />
                    <PurchaseCredits />
                  </div>
                </div>
              </>
            )}

            {activeView === "notes" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-3">Internal Notes</h2>
                <ul className="divide-y border rounded-md max-h-[420px] overflow-auto">
                  {loan.notes.length === 0 && (
                    <li className="p-6 text-sm text-muted-foreground text-center">
                      No notes yet.
                    </li>
                  )}
                  {[...loan.notes].reverse().map((n) => (
                    <li key={n.id} className="p-4">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{n.author}</span>{" "}
                        · {new Date(n.ts).toLocaleString()}
                      </div>
                      <div className="text-sm mt-0.5 whitespace-pre-wrap">{n.body}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
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

            {activeView === "documents" && (
              <div className="p-6 space-y-4">
                <div
                  onClick={() => {
                    addDocument(loan.id, `Document_${Date.now()}.pdf`);
                    toast.success("Document uploaded (mock)");
                  }}
                  className="border-2 border-dashed rounded-md p-10 text-center bg-muted/30 hover:bg-muted/50 cursor-pointer"
                >
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    Drop files here or click to upload
                  </p>
                </div>
                <ul className="divide-y border rounded-md">
                  {loan.documents.length === 0 ? (
                    <li className="p-6 text-sm text-muted-foreground text-center">
                      No documents uploaded yet.
                    </li>
                  ) : (
                    loan.documents.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {d.name}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.uploadedAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ----------------------- shared bits ----------------------- */

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function IconChip({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md border text-[var(--link)] border-[var(--link)]/30 hover:bg-blue-50"
    >
      {children}
    </button>
  );
}

function SidebarIconBtn({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      title={title}
      className="h-7 w-7 inline-flex items-center justify-center rounded border text-[var(--link)] hover:bg-muted"
    >
      {children}
    </button>
  );
}

function SideItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left",
        active
          ? "bg-blue-50 text-[var(--link)] font-medium"
          : "text-foreground/80 hover:bg-muted"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function SideCount({
  label,
  count,
  onClick,
  active,
}: {
  label: string;
  count: string | number | null;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs text-left",
        active ? "bg-blue-50 text-[var(--link)] font-medium" : "text-foreground/80 hover:bg-muted"
      )}
    >
      <span className="truncate">{label}</span>
      {count != null && (
        <span className="text-[10px] px-1.5 rounded bg-muted text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

function SubTabBtn({
  active,
  onClick,
  error,
  children,
}: {
  active: boolean;
  onClick: () => void;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-3 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5",
        active
          ? error
            ? "border-rose-500 text-rose-600"
            : "border-[var(--link)] text-[var(--link)]"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {error && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
      {children}
    </button>
  );
}

/* ----------------------- form sections ----------------------- */

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-9 rounded-md border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--link)]/30";
const selectCls = inputCls + " appearance-none";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 -mx-6 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function LoanInfoForm({
  loan,
  downPayment,
  downPct,
}: {
  loan: { purchasePrice: number; arv: number; loanAmount: number; ltv: number; interestRate: number; termMonths: number };
  downPayment: number;
  downPct: string;
}) {
  const [kind, setKind] = useState<"purchase" | "refinance">("purchase");
  return (
    <div className="space-y-5">
      {/* Purchase / Refinance toggle */}
      <div className="grid grid-cols-2 rounded-md border overflow-hidden">
        {(["purchase", "refinance"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "py-2.5 text-sm font-medium capitalize",
              kind === k
                ? "bg-blue-50 text-[var(--link)]"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Purchase Price" required>
          <input className={inputCls} defaultValue={currency(loan.purchasePrice)} />
        </Field>
        <Field label="Appraised Value" required>
          <input className={inputCls} defaultValue={currency(loan.arv)} />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_120px_1fr_120px] gap-3">
        <Field label="Down Payment">
          <input className={inputCls} defaultValue={currency(downPayment)} />
        </Field>
        <Field label="Sources">
          <input className={inputCls} defaultValue={`${downPct}%`} />
        </Field>
        <Field label="Base Loan Amount">
          <input className={inputCls} defaultValue={currency(loan.loanAmount)} />
        </Field>
        <Field label="LTV">
          <input className={inputCls} defaultValue={`${loan.ltv.toFixed(3)}%`} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mortgage Type" required>
          <select className={selectCls} defaultValue="Non-QM">
            <option>Non-QM</option>
            <option>Conventional</option>
            <option>FHA</option>
            <option>VA</option>
          </select>
        </Field>
        <Field label="Lien Position" required>
          <select className={selectCls} defaultValue="First Lien">
            <option>First Lien</option>
            <option>Second Lien</option>
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium">Total Loan Amount: </span>
          <span className="font-semibold">{currency(loan.loanAmount)}.00</span>
          <Info className="inline-block ml-1 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="rounded border" /> Subordinate Liens
      </label>

      <div className="grid grid-cols-3 gap-6 border-t pt-3">
        <Ratio label="LTV" value={`${loan.ltv.toFixed(2)}%`} />
        <Ratio label="CLTV" value={`${loan.ltv.toFixed(2)}%`} />
        <Ratio label="HCLTV" value={`${loan.ltv.toFixed(2)}%`} />
      </div>

      <Field label="Amortization Type">
        <select className={selectCls} defaultValue="Fixed">
          <option>Fixed</option>
          <option>ARM</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Note Rate" required>
          <input className={inputCls} defaultValue={`${loan.interestRate.toFixed(3)}%`} />
        </Field>
        <Field label="Qualifying Rate">
          <input className={inputCls} placeholder="%" />
        </Field>
      </div>

      <Field label="Interest Rate Buydown">
        <select className={selectCls} defaultValue="None">
          <option>None</option>
          <option>2-1</option>
          <option>3-2-1</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Amortization Term" required>
          <div className="relative">
            <input className={inputCls} defaultValue={String(loan.termMonths * 30)} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              months
            </span>
          </div>
        </Field>
        <Field label="Interest Only">
          <div className="flex items-center h-9 px-3 rounded-md border bg-muted/30 text-sm text-muted-foreground justify-between">
            <span>months</span>
            <span className="inline-flex h-4 w-7 rounded-full bg-muted-foreground/30" />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Impound Waiver">
          <select className={selectCls} defaultValue="None Waived">
            <option>None Waived</option>
            <option>All Waived</option>
          </select>
        </Field>
        <Field label="Loan FICO">
          <input className={inputCls} defaultValue="660" />
        </Field>
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border" /> LPA Offering
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border" /> Business Purpose Loan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked className="rounded border" /> Alternate Doc Loan
        </label>
        <div className="grid grid-cols-2 gap-4 pl-6 mt-2">
          <Field label="Select Doc Type" required>
            <select className={selectCls} defaultValue="Full Doc 24mo">
              <option>Full Doc 24mo</option>
              <option>Full Doc 12mo</option>
              <option>Bank Statements</option>
            </select>
          </Field>
        </div>
      </div>

      <button className="text-sm font-medium text-[var(--link)] hover:underline inline-flex items-center gap-1">
        Advanced Features <ChevronLeft className="h-3 w-3 -rotate-90" />
      </button>
    </div>
  );
}

function PropertyInfoForm({
  loan,
}: {
  loan: { propertyAddress: string; propertyCity: string; propertyState: string; propertyZip: string; propertyType: string };
}) {
  return (
    <div className="space-y-5">
      <SectionTitle>Property Info</SectionTitle>

      <div className="flex items-center justify-between -mt-2">
        <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
          <span className="text-rose-500">•</span> Subject Property Address{" "}
          <span className="text-rose-500">*</span>{" "}
          <button className="ml-1 text-[var(--link)] hover:underline">AVM Check</button>
        </label>
        <label className="inline-flex items-center gap-2 text-xs">
          <span className="inline-flex h-4 w-7 rounded-full bg-[var(--link)] relative">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
          </span>
          To Be Determined
        </label>
      </div>
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <input className={inputCls} defaultValue={loan.propertyAddress} />
        <input className={inputCls} placeholder="Unit / Apt" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} defaultValue={loan.propertyCity} placeholder="City" />
        <select className={selectCls} defaultValue={loan.propertyState}>
          <option>{loan.propertyState}</option>
          <option>California (CA)</option>
          <option>Georgia (GA)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} defaultValue={loan.propertyZip} />
        <select className={selectCls} defaultValue="Lake">
          <option>Lake</option>
          <option>Fulton</option>
        </select>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1">Occupancy</div>
        <div className="grid grid-cols-3 rounded-md border overflow-hidden">
          {["Primary Residence", "Second Home", "Investment"].map((o, i) => (
            <button
              key={o}
              className={cn(
                "py-2.5 text-sm",
                i === 0
                  ? "bg-blue-50 text-[var(--link)] font-medium"
                  : "bg-card text-muted-foreground"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border" /> Mixed Use Property
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border" /> Non Occupant Co-Borrower
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Community Property State</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked className="rounded border" />
          The property is in community property state
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Energy Improvement</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border" />
          Mortgage loan will finance energy-related improvements
        </label>
        <label className="flex items-center gap-2 text-sm mt-1">
          <input type="checkbox" className="rounded border" />
          Property lien could take priority over the first mortgage lien
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Transaction Detail</div>
        {[
          "Conversion of Contract for Deed or Land Contract",
          "Renovation",
          "Construction Loan",
        ].map((l) => (
          <label key={l} className="flex items-center gap-2 text-sm mt-1">
            <input type="checkbox" className="rounded border" />
            {l}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Lot Acquired Date">
          <input className={inputCls} placeholder="MM/DD/YYYY" />
        </Field>
        <Field label="Original Cost of Lot">
          <input className={inputCls} placeholder="Enter Amount" />
        </Field>
      </div>
    </div>
  );
}

function TitleInfoForm() {
  return (
    <div className="space-y-5">
      <SectionTitle>Title Info</SectionTitle>
      <Field label="Manner in which Title will be held">
        <select className={selectCls}>
          <option>-- Select --</option>
          <option>Sole Ownership</option>
          <option>Joint Tenants</option>
        </select>
      </Field>
      <Field label="Title to the property will be held in what name(s)">
        <input className={inputCls} />
      </Field>
      <Field label="Vesting To Read">
        <select className={selectCls}>
          <option>-- Select --</option>
        </select>
      </Field>
      <Field label="Trust Information">
        <select className={selectCls}>
          <option>-- Select --</option>
        </select>
      </Field>
      <Field label="Indian Country Land Tenure">
        <select className={selectCls}>
          <option>-- Select --</option>
        </select>
      </Field>
      <Field label="Estate will be held in">
        <select className={selectCls} defaultValue="Fee Simple">
          <option>Fee Simple</option>
          <option>Leasehold</option>
        </select>
      </Field>
    </div>
  );
}

function Ratio({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-emerald-600 underline underline-offset-4 decoration-emerald-500">
        {value}
      </div>
    </div>
  );
}

/* ----------------------- right column ----------------------- */

function ProposedPayment({ monthly }: { monthly: number }) {
  return (
    <div className="border rounded-md bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Proposed Monthly Payment</h3>
        <button className="inline-flex items-center gap-1 text-xs text-[var(--link)] hover:underline">
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>
      <div className="text-[11px]">
        <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.8fr_0.8fr] gap-2 px-3 py-1.5 text-muted-foreground uppercase tracking-wide border-b">
          <span>Parameters</span>
          <span>Is Calc?</span>
          <span>Factor</span>
          <span>Value</span>
          <span className="text-right">Monthly</span>
        </div>
        <PayRow label="First Mortgage" monthly={`$${monthly.toFixed(2)}`} />
        <PayRow label="Other Financing" />
        <PayRow label="HOI" error />
        <PayRow label="Supplemental" />
        <PayRow label="Property Taxes" error />
        <PayRow label="MI" calc="PPE" monthly="$0.00" />
        <PayRow label="Association Dues" value="$0" monthly="$0.00" />
        <PayRow label="Other" value="$0" monthly="$0.00" />
        <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.8fr_0.8fr] gap-2 px-3 py-2 border-t font-semibold text-sm">
          <span className="col-span-4">Total PITI</span>
          <span className="text-right tabular-nums">${monthly.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function PayRow({
  label,
  error,
  calc,
  value,
  monthly,
}: {
  label: string;
  error?: boolean;
  calc?: string;
  value?: string;
  monthly?: string;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.8fr_0.8fr] gap-2 px-3 py-2 border-b text-xs items-center">
      <span className={cn("flex items-center gap-1", error && "text-rose-600")}>
        {error && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
        {label}
      </span>
      <span className="text-muted-foreground">
        {calc ? <span className="text-[var(--link)]">{calc}</span> : "No"}
      </span>
      <span className="text-muted-foreground">Monthly</span>
      <span className="text-muted-foreground">{value ?? "$"}</span>
      <span className="text-right tabular-nums">{monthly ?? "--"}</span>
    </div>
  );
}

function PurchaseCredits() {
  return (
    <div className="border rounded-md bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Purchase Credits: --</h3>
        <button className="inline-flex items-center gap-1 text-xs text-[var(--link)] hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground grid grid-cols-3 px-3 py-1.5 border-b">
        <span>Credit Type</span>
        <span>Source Type</span>
        <span>Amount</span>
      </div>
      <div className="p-6 text-sm text-muted-foreground text-center">
        No records found
      </div>
    </div>
  );
}
