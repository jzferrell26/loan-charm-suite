import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { formatDate, timeAgo } from "@/lib/format";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/borrowers")({
  head: () => ({ meta: [{ title: "Borrowers — Processing Portal" }] }),
  component: BorrowersPage,
});

function BorrowersPage() {
  const borrowers = useStore((s) => s.borrowers);
  const addBorrower = useStore((s) => s.addBorrower);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const sorted = useMemo(
    () =>
      [...borrowers].sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
      ),
    [borrowers]
  );
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  return (
    <div>
      <div className="bg-card border-b px-6 h-14 flex items-center">
        <h1 className="text-sm font-semibold">Borrowers</h1>
        <div className="ml-auto">
          <button
            onClick={() => {
              const id = `B${Date.now()}`;
              addBorrower({
                id,
                firstName: "New",
                lastName: "Borrower",
                email: "new@example.com",
                phone: "--",
                ssn: "***-**-0000",
                address: "--",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--link)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Borrower
          </button>
        </div>
      </div>
      <div className="bg-card">
        <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_1.5fr] gap-3 px-6 py-2.5 text-xs font-medium text-muted-foreground border-b">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Created On</div>
          <div>Last Updated</div>
          <div>Address</div>
        </div>
        <ul>
          {pageRows.map((b) => (
            <li
              key={b.id}
              className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_1.5fr] gap-3 px-6 py-3 items-center text-sm border-b hover:bg-muted/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={`${b.firstName} ${b.lastName}`} size={32} />
                <span className="text-[var(--link)] font-medium truncate">
                  {b.firstName} {b.lastName}
                </span>
              </div>
              <div className="truncate text-muted-foreground">{b.email}</div>
              <div className="text-muted-foreground">{b.phone}</div>
              <div className="text-muted-foreground">{formatDate(b.createdAt)}</div>
              <div className="text-muted-foreground">{timeAgo(b.updatedAt)}</div>
              <div className="truncate text-muted-foreground">{b.address}</div>
            </li>
          ))}
        </ul>
      </div>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} total={sorted.length} pageSize={pageSize} />
    </div>
  );
}

function Pagination({
  page,
  setPage,
  totalPages,
  total,
  pageSize,
}: {
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground bg-card border-t">
      <div>
        Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} Results
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40">‹</button>
        <span className="px-2">{page} / {totalPages}</span>
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-2 py-1 rounded hover:bg-muted disabled:opacity-40">›</button>
      </div>
    </div>
  );
}
