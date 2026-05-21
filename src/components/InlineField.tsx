import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value: string | number | null | undefined;
  onSave: (v: string | null) => Promise<void> | void;
  type?: "text" | "number" | "date" | "textarea";
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
};

export function InlineField({ label, value, onSave, type = "text", placeholder, className, prefix, suffix }: Props) {
  const [val, setVal] = useState<string>(value == null ? "" : String(value));
  const initial = useRef(value == null ? "" : String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = value == null ? "" : String(value);
    setVal(next);
    initial.current = next;
  }, [value]);

  function commit(v: string) {
    if (v === initial.current) return;
    initial.current = v;
    void onSave(v === "" ? null : v);
  }

  function onChange(v: string) {
    setVal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(v), 600);
  }

  function onBlur() {
    if (timer.current) clearTimeout(timer.current);
    commit(val);
  }

  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {type === "textarea" ? (
        <Textarea value={val} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} rows={3} />
      ) : (
        <div className="relative">
          {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
          <Input
            type={type}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={(prefix ? "pl-6 " : "") + (suffix ? "pr-7 " : "")}
            step={type === "number" ? "any" : undefined}
          />
          {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
        </div>
      )}
    </div>
  );
}
