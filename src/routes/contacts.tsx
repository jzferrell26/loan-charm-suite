import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/format";
import { ChevronDown, Plus } from "lucide-react";

export const Route = createFileRoute("/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Processing Portal" }] }),
  component: ContactsPage,
});

const TYPES = ["All Contact Types", "Real Estate Agent", "Escrow Agent", "Title Rep", "Attorney"];

function ContactsPage() {
  const contacts = useStore((s) => s.contacts);
  const addContact = useStore((s) => s.addContact);
  const [type, setType] = useState("All Contact Types");
  const [company, setCompany] = useState("All Companies");

  const companies = useMemo(
    () => ["All Companies", ...Array.from(new Set(contacts.map((c) => c.company))).sort()],
    [contacts]
  );

  const filtered = useMemo(
    () =>
      contacts
        .filter((c) => (type === "All Contact Types" ? true : c.type === type))
        .filter((c) => (company === "All Companies" ? true : c.company === company)),
    [contacts, type, company]
  );

  return (
    <div>
      <div className="bg-card border-b px-6 h-14 flex items-center gap-3">
        <h1 className="text-sm font-semibold">Business Contacts</h1>
        <Select value={type} onChange={setType} options={TYPES} />
        <Select value={company} onChange={setCompany} options={companies} />
        <div className="ml-auto">
          <button
            onClick={() => {
              addContact({
                id: `C${Date.now()}`,
                name: "New Contact",
                type: "Real Estate Agent",
                company: "--",
                email: "new@example.com",
                phone: "--",
                updatedAt: new Date().toISOString(),
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--link)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Contact
          </button>
        </div>
      </div>
      <div className="bg-card">
        <div className="grid grid-cols-[2fr_1.4fr_1.6fr_2fr_1.2fr_1fr] gap-3 px-6 py-2.5 text-xs font-medium text-muted-foreground border-b">
          <div>Name</div>
          <div>Type</div>
          <div>Company</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Last Updated</div>
        </div>
        <ul>
          {filtered.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-[2fr_1.4fr_1.6fr_2fr_1.2fr_1fr] gap-3 px-6 py-3 items-center text-sm border-b hover:bg-muted/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={c.name} size={32} />
                <span className="text-[var(--link)] font-medium truncate">{c.name}</span>
              </div>
              <div className="text-muted-foreground">{c.type}</div>
              <div className="text-muted-foreground truncate">{c.company}</div>
              <div className="text-muted-foreground truncate">{c.email}</div>
              <div className="text-muted-foreground">{c.phone}</div>
              <div className="text-muted-foreground">{timeAgo(c.updatedAt)}</div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-muted-foreground">
              No contacts match these filters.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-8 rounded-full border bg-card pl-3 pr-8 text-sm hover:bg-muted/40"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
