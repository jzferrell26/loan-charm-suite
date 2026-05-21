import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { STAGES, type Loan } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/loans/new")({
  head: () => ({ meta: [{ title: "New Loan — Processing Portal" }] }),
  component: NewLoanPage,
});

const blank = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  ssn: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  propertyType: "Single Family",
  purchasePrice: "",
  arv: "",
  loanAmount: "",
  interestRate: "",
  termMonths: "12",
  points: "2",
  originationFee: "",
  maturityDate: "",
  lender: "",
};

function NewLoanPage() {
  const [f, setF] = useState(blank);
  const addLoan = useStore((s) => s.addLoan);
  const navigate = useNavigate();

  const set = (k: keyof typeof blank, v: string) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const submit = (draft: boolean) => {
    if (!f.firstName || !f.lastName || !f.address) {
      toast.error("Please fill borrower name and property address");
      return;
    }
    const purchasePrice = Number(f.purchasePrice) || 0;
    const loanAmount = Number(f.loanAmount) || 0;
    const newLoan: Loan = {
      id: `L${Date.now()}`,
      loanNumber: String(Math.floor(10000000 + Math.random() * 9000000)),
      borrowerId: `B${Date.now()}`,
      borrowerName: `${f.firstName} ${f.lastName}`.trim(),
      borrowers: [
        {
          borrowerId: `B${Date.now()}`,
          name: `${f.firstName} ${f.lastName}`.trim(),
          email: (f as { email?: string }).email ?? "",
          phone: (f as { phone?: string }).phone ?? "",
          role: "Primary",
          status: "Needs In-Review · Full App",
        },
      ],
      propertyAddress: f.address,
      propertyCity: f.city,
      propertyState: f.state,
      propertyZip: f.zip,
      propertyType: f.propertyType,
      purchasePrice,
      arv: Number(f.arv) || 0,
      loanAmount,
      interestRate: Number(f.interestRate) || 0,
      ltv: purchasePrice ? Math.round((loanAmount / purchasePrice) * 1000) / 10 : 0,
      termMonths: Number(f.termMonths) || 12,
      points: Number(f.points) || 0,
      originationFee: Number(f.originationFee) || 0,
      maturityDate: f.maturityDate || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      lender: f.lender,
      stage: draft ? "Application Received" : "Loan Setup",
      tasksDue: 0,
      conditionsPending: 0,
      trackers: { itp: false, appraisal: false, title: false },
      lastUpdated: new Date().toISOString(),
      notes: [],
      documents: [],
    };
    addLoan(newLoan);
    toast.success(draft ? "Saved as draft" : "Loan submitted");
    navigate({ to: "/loans/$loanId", params: { loanId: newLoan.id } });
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-semibold mb-4">New Loan</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Borrower Info">
          <Field label="First Name" value={f.firstName} onChange={(v) => set("firstName", v)} />
          <Field label="Last Name" value={f.lastName} onChange={(v) => set("lastName", v)} />
          <Field label="Email" value={f.email} onChange={(v) => set("email", v)} />
          <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
          <Field label="SSN" value={f.ssn} onChange={(v) => set("ssn", v)} placeholder="***-**-1234" />
        </Section>
        <Section title="Property Info">
          <Field label="Address" value={f.address} onChange={(v) => set("address", v)} />
          <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
          <Field label="State" value={f.state} onChange={(v) => set("state", v)} />
          <Field label="Zip" value={f.zip} onChange={(v) => set("zip", v)} />
          <SelectField
            label="Property Type"
            value={f.propertyType}
            onChange={(v) => set("propertyType", v)}
            options={["Single Family", "Multi-Family", "Condo", "Townhouse"]}
          />
          <Field label="Purchase Price" value={f.purchasePrice} onChange={(v) => set("purchasePrice", v)} />
          <Field label="ARV" value={f.arv} onChange={(v) => set("arv", v)} />
        </Section>
        <Section title="Loan Terms">
          <Field label="Loan Amount" value={f.loanAmount} onChange={(v) => set("loanAmount", v)} />
          <Field label="Interest Rate (%)" value={f.interestRate} onChange={(v) => set("interestRate", v)} />
          <Field label="Term (months)" value={f.termMonths} onChange={(v) => set("termMonths", v)} />
          <Field label="Points" value={f.points} onChange={(v) => set("points", v)} />
          <Field label="Origination Fee" value={f.originationFee} onChange={(v) => set("originationFee", v)} />
          <Field label="Maturity Date" value={f.maturityDate} onChange={(v) => set("maturityDate", v)} placeholder="YYYY-MM-DD" />
          <Field label="Lender" value={f.lender} onChange={(v) => set("lender", v)} />
        </Section>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={() => submit(true)}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Save as Draft
        </button>
        <button
          onClick={() => submit(false)}
          className="rounded-md bg-[var(--link)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-md">
      <div className="px-4 py-3 border-b text-sm font-semibold">{title}</div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--link)]/30"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border bg-card px-2 text-sm"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

// Silence unused STAGES import in build
void STAGES;
