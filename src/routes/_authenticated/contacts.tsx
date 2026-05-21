import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContacts, createContact, updateContact } from "@/lib/contacts.functions";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CONTACT_TYPES, fullName, type Contact } from "@/lib/domain";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contacts")({
  component: ContactsList,
});

type ContactForm = {
  first_name: string;
  last_name: string;
  contact_type: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
};

const emptyForm = (): ContactForm => ({
  first_name: "",
  last_name: "",
  contact_type: "Real Estate Agent",
  company_name: "",
  email: "",
  phone: "",
  address: "",
});

function contactToForm(c: Contact): ContactForm {
  return {
    first_name: c.first_name ?? "",
    last_name: c.last_name ?? "",
    contact_type: c.contact_type ?? "Real Estate Agent",
    company_name: c.company_name ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
  };
}

function ContactsList() {
  const fn = useServerFn(listContacts);
  const create = useServerFn(createContact);
  const update = useServerFn(updateContact);
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => fn() });
  const [filter, setFilter] = useState<string>("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm());

  const editing = editId ? contacts.find((c) => c.id === editId) : null;
  const filtered = filter === "All" ? contacts : contacts.filter((c) => c.contact_type === filter);

  function openCreate() {
    setForm(emptyForm());
    setCreateOpen(true);
  }

  function openEdit(c: Contact) {
    setForm(contactToForm(c));
    setEditId(c.id);
  }

  function closeDialogs() {
    setCreateOpen(false);
    setEditId(null);
    setForm(emptyForm());
  }

  async function saveCreate() {
    try {
      await create({ data: form as never });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      closeDialogs();
      toast.success("Contact added");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function saveEdit() {
    if (!editId) return;
    try {
      await update({ data: { id: editId, patch: form as never } });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      closeDialogs();
      toast.success("Contact updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Dialog open={createOpen} onOpenChange={(o) => (o ? openCreate() : closeDialogs())}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>+ Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Contact</DialogTitle>
            </DialogHeader>
            <ContactFields form={form} setForm={setForm} />
            <Button onClick={() => void saveCreate()}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editId} onOpenChange={(o) => !o && closeDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact{editing ? ` — ${fullName(editing)}` : ""}</DialogTitle>
          </DialogHeader>
          <ContactFields form={form} setForm={setForm} />
          <Button onClick={() => void saveEdit()}>Save changes</Button>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        {["All", ...CONTACT_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs border ${filter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}
          >
            {t}
          </button>
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
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => openEdit(c)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size={28} />
                      <span className="font-medium">{name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.contact_type ?? "—"}</td>
                  <td className="px-4 py-3">{c.company_name ?? "—"}</td>
                  <td className="px-4 py-3">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(c.updated_at)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No contacts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactFields({
  form,
  setForm,
}: {
  form: ContactForm;
  setForm: React.Dispatch<React.SetStateAction<ContactForm>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <Fld label="First name">
        <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
      </Fld>
      <Fld label="Last name">
        <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
      </Fld>
      <Fld label="Type">
        <select
          value={form.contact_type}
          onChange={(e) => setForm({ ...form, contact_type: e.target.value })}
          className="h-9 w-full rounded-md border bg-white px-3 text-sm"
        >
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Fld>
      <Fld label="Company">
        <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
      </Fld>
      <Fld label="Email">
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Fld>
      <Fld label="Phone">
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Fld>
      <Fld label="Address" className="col-span-2">
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </Fld>
    </div>
  );
}

function Fld({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + className}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
