import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { createLoan } from "@/lib/loans.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LOAN_PURPOSES, LOAN_TYPES, PROPERTY_TYPES, PROPERTY_USAGES } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/loans/new")({
  component: NewLoan,
});

type BorrowerDraft = { first_name: string; last_name: string; email: string; phone: string };

function NewLoan() {
  const create = useServerFn(createLoan);
  const qc = useQueryClient();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const [borrowers, setBorrowers] = useState<BorrowerDraft[]>([
    { first_name: "", last_name: "", email: "", phone: "" },
  ]);
  const [property, setProperty] = useState({
    address_line: "", city: "", state: "", zip: "",
    property_type: "Single Family", property_usage: "Investment",
    purchase_price: "", arv: "",
  });
  const [loan, setLoan] = useState({
    loan_purpose: "Purchase", loan_type: "Hard Money",
    loan_amount: "", interest_rate: "", ltv: "", loan_term_months: "",
  });

  async function submit(asDraft: boolean) {
    if (!borrowers[0].first_name || !borrowers[0].last_name) {
      toast.error("Primary borrower name is required");
      return;
    }
    setBusy(true);
    try {
      const { id } = await create({
        data: {
          loan: { ...loan, stage: asDraft ? "APPLICATION_SENT" : "APPLICATION_RECEIVED" } as never,
          borrowers: borrowers.map((b, i) => ({ ...b, borrower_sequence: i + 1 })) as never,
          property: property as never,
        },
      });
      qc.invalidateQueries({ queryKey: ["loans"] });
      toast.success(asDraft ? "Draft saved" : "Loan created");
      nav({ to: "/loans/$loanId", params: { loanId: id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6 space-y-6">
      <h1 className="text-xl font-semibold">New Loan</h1>

      <Section title="Borrowers">
        {borrowers.map((b, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 mb-3">
            <Field label={i === 0 ? "First name *" : "First name"}><Input value={b.first_name} onChange={(e) => updateB(i, "first_name", e.target.value)} /></Field>
            <Field label="Last name"><Input value={b.last_name} onChange={(e) => updateB(i, "last_name", e.target.value)} /></Field>
            <Field label="Email"><Input value={b.email} onChange={(e) => updateB(i, "email", e.target.value)} /></Field>
            <Field label="Phone"><Input value={b.phone} onChange={(e) => updateB(i, "phone", e.target.value)} /></Field>
          </div>
        ))}
        {borrowers.length < 4 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setBorrowers([...borrowers, { first_name: "", last_name: "", email: "", phone: "" }])}>
            + Add co-borrower
          </Button>
        )}
      </Section>

      <Section title="Property">
        <div className="grid grid-cols-4 gap-3">
          <Field label="Address" className="col-span-2"><Input value={property.address_line} onChange={(e) => setProperty({ ...property, address_line: e.target.value })} /></Field>
          <Field label="City"><Input value={property.city} onChange={(e) => setProperty({ ...property, city: e.target.value })} /></Field>
          <Field label="State"><Input value={property.state} onChange={(e) => setProperty({ ...property, state: e.target.value })} /></Field>
          <Field label="Zip"><Input value={property.zip} onChange={(e) => setProperty({ ...property, zip: e.target.value })} /></Field>
          <Field label="Type"><Select value={property.property_type} onChange={(v) => setProperty({ ...property, property_type: v })} options={PROPERTY_TYPES} /></Field>
          <Field label="Usage"><Select value={property.property_usage} onChange={(v) => setProperty({ ...property, property_usage: v })} options={PROPERTY_USAGES} /></Field>
          <Field label="Purchase price"><Input type="number" value={property.purchase_price} onChange={(e) => setProperty({ ...property, purchase_price: e.target.value })} /></Field>
          <Field label="ARV"><Input type="number" value={property.arv} onChange={(e) => setProperty({ ...property, arv: e.target.value })} /></Field>
        </div>
      </Section>

      <Section title="Loan Terms">
        <div className="grid grid-cols-4 gap-3">
          <Field label="Purpose"><Select value={loan.loan_purpose} onChange={(v) => setLoan({ ...loan, loan_purpose: v })} options={LOAN_PURPOSES} /></Field>
          <Field label="Type"><Select value={loan.loan_type} onChange={(v) => setLoan({ ...loan, loan_type: v })} options={LOAN_TYPES} /></Field>
          <Field label="Loan amount"><Input type="number" value={loan.loan_amount} onChange={(e) => setLoan({ ...loan, loan_amount: e.target.value })} /></Field>
          <Field label="Interest rate %"><Input type="number" step="0.01" value={loan.interest_rate} onChange={(e) => setLoan({ ...loan, interest_rate: e.target.value })} /></Field>
          <Field label="LTV %"><Input type="number" step="0.1" value={loan.ltv} onChange={(e) => setLoan({ ...loan, ltv: e.target.value })} /></Field>
          <Field label="Term (months)"><Input type="number" value={loan.loan_term_months} onChange={(e) => setLoan({ ...loan, loan_term_months: e.target.value })} /></Field>
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={busy} onClick={() => submit(true)}>Save as Draft</Button>
        <Button disabled={busy} onClick={() => submit(false)}>Submit</Button>
      </div>
    </div>
  );

  function updateB(i: number, k: keyof BorrowerDraft, v: string) {
    setBorrowers((bs) => bs.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1.5 " + className}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border bg-white px-3 text-sm">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
