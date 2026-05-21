import { groupOfStage, STAGE_LABELS, type Stage } from "@/lib/domain";
import { cn } from "@/lib/utils";

const groupStyles: Record<string, string> = {
  Prospect: "bg-blue-50 text-blue-700 ring-blue-200",
  Processing: "bg-violet-50 text-violet-700 ring-violet-200",
  Closing: "bg-orange-50 text-orange-700 ring-orange-200",
  Funded: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const dotColors: Record<string, string> = {
  Prospect: "bg-blue-500",
  Processing: "bg-violet-500",
  Closing: "bg-orange-500",
  Funded: "bg-emerald-500",
};

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const group = groupOfStage(stage);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        groupStyles[group],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[group])} />
      {STAGE_LABELS[stage]}
    </span>
  );
}
