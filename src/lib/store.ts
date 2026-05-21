import { create } from "zustand";
import {
  initialBorrowers,
  initialContacts,
  initialLoans,
  type Borrower,
  type Contact,
  type Loan,
  type Stage,
} from "./mock-data";

type State = {
  loans: Loan[];
  borrowers: Borrower[];
  contacts: Contact[];
  updateLoanStage: (loanId: string, newStage: Stage) => void;
  addNote: (loanId: string, body: string) => void;
  addDocument: (loanId: string, name: string) => void;
  addLoan: (loan: Loan) => void;
  addBorrower: (b: Borrower) => void;
  addContact: (c: Contact) => void;
};

const WEBHOOK_URL =
  "https://n8n.voyze.ai/webhook/processing-portal-stage-change";

function fireStageWebhook(payload: {
  loan_id: string;
  borrower_name: string;
  old_stage: string;
  new_stage: string;
  timestamp: string;
}) {
  try {
    fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}

export const useStore = create<State>((set, get) => ({
  loans: initialLoans,
  borrowers: initialBorrowers,
  contacts: initialContacts,
  updateLoanStage: (loanId, newStage) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan || loan.stage === newStage) return;
    const oldStage = loan.stage;
    set((s) => ({
      loans: s.loans.map((l) =>
        l.id === loanId
          ? { ...l, stage: newStage, lastUpdated: new Date().toISOString() }
          : l
      ),
    }));
    fireStageWebhook({
      loan_id: loanId,
      borrower_name: loan.borrowerName,
      old_stage: oldStage,
      new_stage: newStage,
      timestamp: new Date().toISOString(),
    });
  },
  addNote: (loanId, body) =>
    set((s) => ({
      loans: s.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              notes: [
                ...l.notes,
                {
                  id: `n${Date.now()}`,
                  ts: new Date().toISOString(),
                  author: "You",
                  body,
                },
              ],
              lastUpdated: new Date().toISOString(),
            }
          : l
      ),
    })),
  addDocument: (loanId, name) =>
    set((s) => ({
      loans: s.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              documents: [
                ...l.documents,
                {
                  id: `d${Date.now()}`,
                  name,
                  uploadedAt: new Date().toISOString(),
                },
              ],
            }
          : l
      ),
    })),
  addLoan: (loan) => set((s) => ({ loans: [loan, ...s.loans] })),
  addBorrower: (b) => set((s) => ({ borrowers: [b, ...s.borrowers] })),
  addContact: (c) => set((s) => ({ contacts: [c, ...s.contacts] })),
}));
