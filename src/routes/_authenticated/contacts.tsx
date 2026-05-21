import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContacts, createContact } from "@/lib/contacts.functions";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CONTACT_TYPES, fullName } from "@/lib/domain";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contacts")({
  component: ContactsList,
});

function ContactsList() {
  const fn = useServerFn(listContacts);
  const create = useServerFn(createContact);
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => fn() });
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", contact_type: "Real Estate Agent", company_name: "", email: "", phone: "" });

  const filtered = filter === "All" ? contacts : contacts.filter((c) => c.contact_type === filter);

  async function add() {
    try {
      await create({ data: form as never });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setOpen(false);
      setForm({ first_name: "", last_name: "", contact_type: "Real Estate Agent", company_name: "", email: "", phone: "" });
      toast.success("Contact added");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Contact</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Contact</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Fld label="First name"><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Fld>
              <Fld label="Last name"><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Fld>
              <Fld label="Type">
                <select value={form.contact_type} onChange={(e) => setForm({ ...form, contact_type: e.target.value })} className="h-9 w-full rounded-md border bg-white px-3 text-sm">
                  {CONTACT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Fld>
              <Fld label="Company"><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></Fld>
              <Fld label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Fld>
              <Fld label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Fld>
            </div>
            <Button onClick={add}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-2">
        {["All", ...CONTACT_TYPES].map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-xs border ${filter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>{t}</button>
        ))}
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Type</th>
              <th className="text-left px-4 py-2.5">Company</th>
              <th className="text-left px-4 py-2.5">Email</th>
              <th className="text-left px-4 py-2.5">Phone</th>
              <th className="text-right px-4 py-2.5">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => {
              const name = fullName(c);
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={name} size={28} /><span>{name || "—"}</span></div></td>
                  <td className="px-4 py-3">{c.contact_type ?? "—"}</td>
                  <td className="px-4 py-3">{c.company_name ?? "—"}</td>
                  <td className="px-4 py-3">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(c.updated_at)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No contacts.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
