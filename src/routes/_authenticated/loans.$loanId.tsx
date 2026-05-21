import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getLoan,
  updateLoan,
  updateLoanStage,
  addNote,
  upsertBorrower,
  deleteBorrower,
} from "@/lib/loans.functions";
import { StageBadge } from "@/components/StageBadge";
import { InlineField } from "@/components/InlineField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { STAGES, STAGE_LABELS, fullName, type Stage } from "@/lib/domain";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/loans/$loanId")({
  component: LoanDetail,
});

function LoanDetail() {
  const { loanId } = Route.useParams();
  const getFn = useServerFn(getLoan);
  const updateFn = useServerFn(updateLoan);
  const stageFn = useServerFn(updateLoanStage);
  const noteFn = useServerFn(addNote);
  const upsertBorrowerFn = useServerFn(upsertBorrower);
  const deleteBorrowerFn = useServerFn(deleteBorrower);
  const qc = useQueryClient();

  const { data: loan } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => getFn({ data: { id: loanId } }),
  });

  const [note, setNote] = useState("");

  if (!loan) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const borrowers = (loan.borrowers ?? [])
    .slice()
    .sort((a, b) => a.borrower_sequence - b.borrower_sequence);
  const primary = borrowers[0];
  const notes = (loan.notes ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));

  async function saveLoan(field: string, value: string | null) {
    try {
      await updateFn({ data: { id: loanId, patch: { [field]: value } as never } });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function saveBorrower(b: { id: string; loan_id: string; borrower_sequence: number }, field: string, value: string | null) {
    try {
      await upsertBorrowerFn({
        data: {
          loan_id: b.loan_id,
          borrower: { id: b.id, borrower_sequence: b.borrower_sequence, [field]: value } as never,
        },
      });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function addBorrower() {
    try {
      const seq = Math.min(4, borrowers.length + 1);
      await upsertBorrowerFn({
        data: { loan_id: loanId, borrower: { borrower_sequence: seq } as never },
      });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function removeBorrower(id: string) {
    try {
      await deleteBorrowerFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

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
          <h1 className="text-xl font-semibold">
            {fullName(primary) || "Untitled"}{" "}
            <span className="text-muted-foreground font-normal">· {loan.loan_number}</span>
          </h1>
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
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quote">Loan Quote</TabsTrigger>
          <TabsTrigger value="epiccc">EPICCC</TabsTrigger>
          <TabsTrigger value="borrowers">Borrowers ({borrowers.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card title="Standard">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Purpose" value={loan.loan_purpose} onSave={(v) => saveLoan("loan_purpose", v)} />
              <InlineField label="Type" value={loan.loan_type} onSave={(v) => saveLoan("loan_type", v)} />
              <InlineField label="Loan amount" type="number" prefix="$" value={loan.loan_amount} onSave={(v) => saveLoan("loan_amount", v)} />
              <InlineField label="Interest rate" type="number" suffix="%" value={loan.interest_rate} onSave={(v) => saveLoan("interest_rate", v)} />
              <InlineField label="LTV" type="number" suffix="%" value={loan.ltv} onSave={(v) => saveLoan("ltv", v)} />
              <InlineField label="Term (months)" type="number" value={loan.loan_term_months} onSave={(v) => saveLoan("loan_term_months", v)} />
              <InlineField label="Points" type="number" value={loan.points} onSave={(v) => saveLoan("points", v)} />
              <InlineField label="Maturity" type="date" value={loan.maturity_date} onSave={(v) => saveLoan("maturity_date", v)} />
              <InlineField label="Purchase price" type="number" prefix="$" value={loan.purchase_price} onSave={(v) => saveLoan("purchase_price", v)} />
              <InlineField label="Down payment" type="number" prefix="$" value={loan.down_payment} onSave={(v) => saveLoan("down_payment", v)} />
              <InlineField label="ARV" type="number" prefix="$" value={loan.arv} onSave={(v) => saveLoan("arv", v)} />
              <InlineField label="Lender" value={loan.lender_name} onSave={(v) => saveLoan("lender_name", v)} />
              <InlineField label="GHL Opportunity ID" value={loan.ghl_opportunity_id} onSave={(v) => saveLoan("ghl_opportunity_id", v)} />
              <InlineField label="Arive Loan ID" value={loan.arive_loan_id} onSave={(v) => saveLoan("arive_loan_id", v)} />
            </div>
          </Card>
        </TabsContent>

        {/* LOAN QUOTE */}
        <TabsContent value="quote" className="space-y-4 mt-4">
          <Card title="Loan Terms">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Loan-Type" value={loan.loan_type} onSave={(v) => saveLoan("loan_type", v)} />
              <InlineField label="Loan Program" value={loan.loan_program} onSave={(v) => saveLoan("loan_program", v)} />
              <InlineField label="Loan Term" value={loan.loan_term} onSave={(v) => saveLoan("loan_term", v)} />
              <InlineField label="LTV/LT-ARV" value={loan.ltv_ltarv} onSave={(v) => saveLoan("ltv_ltarv", v)} placeholder="65% / 70%" />
              <InlineField label="Initial Release Amount" type="number" prefix="$" value={loan.initial_release_amount} onSave={(v) => saveLoan("initial_release_amount", v)} />
              <InlineField label="Hold Back Amount" type="number" prefix="$" value={loan.hold_back_amount} onSave={(v) => saveLoan("hold_back_amount", v)} />
              <InlineField label="Total Loan Amount" type="number" prefix="$" value={loan.loan_amount} onSave={(v) => saveLoan("loan_amount", v)} />
              <InlineField label="Term Sheet" value={loan.term_sheet} onSave={(v) => saveLoan("term_sheet", v)} />
            </div>
          </Card>
          <Card title="Points & Rate">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Rate %" type="number" suffix="%" value={loan.rate_pct} onSave={(v) => saveLoan("rate_pct", v)} />
              <InlineField label="Total Points %" type="number" suffix="%" value={loan.total_points_pct} onSave={(v) => saveLoan("total_points_pct", v)} />
              <InlineField label="Investor Points %" type="number" suffix="%" value={loan.investor_points_pct} onSave={(v) => saveLoan("investor_points_pct", v)} />
              <InlineField label="Investor Fees" type="number" prefix="$" value={loan.investor_fees} onSave={(v) => saveLoan("investor_fees", v)} />
              <InlineField label="Additional Points or Fee" value={loan.additional_points_or_fee} onSave={(v) => saveLoan("additional_points_or_fee", v)} />
              <InlineField label="CL Points %" type="number" suffix="%" value={loan.cl_points_pct} onSave={(v) => saveLoan("cl_points_pct", v)} />
              <InlineField label="CL Rebate %" type="number" suffix="%" value={loan.cl_rebate_pct} onSave={(v) => saveLoan("cl_rebate_pct", v)} />
              <InlineField label="CL Fees" type="number" prefix="$" value={loan.cl_fees} onSave={(v) => saveLoan("cl_fees", v)} />
              <InlineField label="CL Points $" type="number" prefix="$" value={loan.cl_points_amount} onSave={(v) => saveLoan("cl_points_amount", v)} />
              <InlineField label="Total Points & Fees" type="number" prefix="$" value={loan.total_points_and_fees} onSave={(v) => saveLoan("total_points_and_fees", v)} />
              <InlineField label="Referral Points or Fees" type="number" prefix="$" value={loan.referral_points_or_fees} onSave={(v) => saveLoan("referral_points_or_fees", v)} />
            </div>
          </Card>
          <Card title="Third-Party Fees">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Appraisal Fee" type="number" prefix="$" value={loan.appraisal_fee} onSave={(v) => saveLoan("appraisal_fee", v)} />
              <InlineField label="Escrow Fees" type="number" prefix="$" value={loan.escrow_fees} onSave={(v) => saveLoan("escrow_fees", v)} />
              <InlineField label="Title Fees" type="number" prefix="$" value={loan.title_fees} onSave={(v) => saveLoan("title_fees", v)} />
              <InlineField label="Insurance Fee" type="number" prefix="$" value={loan.insurance_fee} onSave={(v) => saveLoan("insurance_fee", v)} />
              <InlineField label="Inspection Fees" type="number" prefix="$" value={loan.inspection_fees} onSave={(v) => saveLoan("inspection_fees", v)} />
              <InlineField label="Misc Fee" type="number" prefix="$" value={loan.misc_fee} onSave={(v) => saveLoan("misc_fee", v)} />
              <InlineField label="Total All Third-Party Fees" type="number" prefix="$" value={loan.total_third_party_fees} onSave={(v) => saveLoan("total_third_party_fees", v)} />
            </div>
          </Card>
          <Card title="Funding">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Monthly Payment" type="number" prefix="$" value={loan.monthly_payment} onSave={(v) => saveLoan("monthly_payment", v)} />
              <InlineField label="Funding Source" value={loan.funding_source} onSave={(v) => saveLoan("funding_source", v)} />
            </div>
          </Card>
        </TabsContent>

        {/* EPICCC */}
        <TabsContent value="epiccc" className="space-y-4 mt-4">
          <Card title="Deal">
            <div className="grid grid-cols-4 gap-3">
              <InlineField label="Loan Purpose" value={loan.loan_purpose} onSave={(v) => saveLoan("loan_purpose", v)} />
              <InlineField label="Exit Strategy" value={loan.exit_strategy} onSave={(v) => saveLoan("exit_strategy", v)} />
              <InlineField label="COE Date" type="date" value={loan.coe_date} onSave={(v) => saveLoan("coe_date", v)} />
              <InlineField label="ARV" type="number" prefix="$" value={loan.arv} onSave={(v) => saveLoan("arv", v)} />
              <InlineField label="Refi Payoff" type="number" prefix="$" value={loan.refi_payoff} onSave={(v) => saveLoan("refi_payoff", v)} />
              <InlineField label="Refi Cash Out" type="number" prefix="$" value={loan.refi_cashout} onSave={(v) => saveLoan("refi_cashout", v)} />
              <InlineField label="Taxes (annual)" type="number" prefix="$" value={loan.taxes_annual} onSave={(v) => saveLoan("taxes_annual", v)} />
              <InlineField label="Insurance (annual)" type="number" prefix="$" value={loan.insurance_annual} onSave={(v) => saveLoan("insurance_annual", v)} />
              <InlineField label="HOA (annual)" type="number" prefix="$" value={loan.hoa_annual} onSave={(v) => saveLoan("hoa_annual", v)} />
              <InlineField label="Working with Another Lender" value={loan.working_with_another_lender} onSave={(v) => saveLoan("working_with_another_lender", v)} />
              <InlineField label="If yes, terms offered" className="col-span-3" value={loan.if_yes_terms_offered} onSave={(v) => saveLoan("if_yes_terms_offered", v)} />
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <InlineField label="GUC / Renovation Plans" type="textarea" value={loan.guc_plans} onSave={(v) => saveLoan("guc_plans", v)} />
              <InlineField label="Additional Important Information" type="textarea" value={loan.additional_info} onSave={(v) => saveLoan("additional_info", v)} />
            </div>
          </Card>
        </TabsContent>

        {/* BORROWERS */}
        <TabsContent value="borrowers" className="space-y-4 mt-4">
          {borrowers.map((b) => (
            <Card
              key={b.id}
              title={`Borrower ${b.borrower_sequence}${b.borrower_sequence === 1 ? " (Primary)" : ""}`}
              right={
                b.borrower_sequence > 1 ? (
                  <Button variant="ghost" size="sm" onClick={() => removeBorrower(b.id)}>Remove</Button>
                ) : null
              }
            >
              <Subhead>Personal</Subhead>
              <div className="grid grid-cols-4 gap-3">
                <InlineField label="First name" value={b.first_name} onSave={(v) => saveBorrower(b, "first_name", v)} />
                <InlineField label="Last name" value={b.last_name} onSave={(v) => saveBorrower(b, "last_name", v)} />
                <InlineField label="Email" value={b.email} onSave={(v) => saveBorrower(b, "email", v)} />
                <InlineField label="Phone" value={b.phone} onSave={(v) => saveBorrower(b, "phone", v)} />
                <InlineField label="DOB" type="date" value={b.dob} onSave={(v) => saveBorrower(b, "dob", v)} />
                <InlineField label="SSN" value={b.ssn} onSave={(v) => saveBorrower(b, "ssn", v)} />
                <InlineField label="Marital Status" value={b.marital_status} onSave={(v) => saveBorrower(b, "marital_status", v)} />
                <InlineField label="Address" value={b.address_line} onSave={(v) => saveBorrower(b, "address_line", v)} />
                <InlineField label="City" value={b.city} onSave={(v) => saveBorrower(b, "city", v)} />
                <InlineField label="State" value={b.state} onSave={(v) => saveBorrower(b, "state", v)} />
                <InlineField label="Zip" value={b.zip} onSave={(v) => saveBorrower(b, "zip", v)} />
              </div>

              <Subhead>EPICCC</Subhead>
              <div className="grid grid-cols-4 gap-3">
                <InlineField label="Experience Level" value={b.experience_level} onSave={(v) => saveBorrower(b, "experience_level", v)} />
                <InlineField label="Properties Owned" type="number" value={b.properties_owned_count} onSave={(v) => saveBorrower(b, "properties_owned_count", v)} />
                <InlineField label="Annual Income" type="number" prefix="$" value={b.annual_income} onSave={(v) => saveBorrower(b, "annual_income", v)} />
                <InlineField label="Liquid Cash" type="number" prefix="$" value={b.liquid_cash} onSave={(v) => saveBorrower(b, "liquid_cash", v)} />
                <InlineField label="Retirement Balance" type="number" prefix="$" value={b.retirement_balance} onSave={(v) => saveBorrower(b, "retirement_balance", v)} />
                <InlineField label="Credit Score" type="number" value={b.credit_score} onSave={(v) => saveBorrower(b, "credit_score", v)} />
                <InlineField label="BK History" value={b.bk_history} onSave={(v) => saveBorrower(b, "bk_history", v)} />
                <InlineField label="Foreclosure History" value={b.foreclosure_history} onSave={(v) => saveBorrower(b, "foreclosure_history", v)} />
              </div>

              <Subhead>Company Info</Subhead>
              <div className="grid grid-cols-4 gap-3">
                <InlineField label="Entity Name" value={b.entity_name} onSave={(v) => saveBorrower(b, "entity_name", v)} />
                <InlineField label="Title (Member, Manager…)" value={b.entity_title} onSave={(v) => saveBorrower(b, "entity_title", v)} />
                <InlineField label="EIN #" value={b.ein} onSave={(v) => saveBorrower(b, "ein", v)} />
                <InlineField label="Entity Address" value={b.entity_address} onSave={(v) => saveBorrower(b, "entity_address", v)} />
                <InlineField label="Entity City" value={b.entity_city} onSave={(v) => saveBorrower(b, "entity_city", v)} />
                <InlineField label="Entity State" value={b.entity_state} onSave={(v) => saveBorrower(b, "entity_state", v)} />
                <InlineField label="Entity Zip" value={b.entity_zip} onSave={(v) => saveBorrower(b, "entity_zip", v)} />
              </div>
            </Card>
          ))}
          {borrowers.length < 4 && (
            <Button variant="outline" onClick={addBorrower}>+ Add co-borrower</Button>
          )}
        </TabsContent>

        {/* NOTES */}
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
      </Tabs>
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-2 first:mt-0">{children}</div>;
}
