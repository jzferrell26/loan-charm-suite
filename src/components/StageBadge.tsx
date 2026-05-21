import { groupOfStage, STAGE_LABELS, type Stage, type StageGroup } from "@/lib/domain";
import { cn } from "@/lib/utils";

const groupStyles: Record<StageGroup, string> = {
  Intake: "bg-blue-50 text-blue-700 ring-blue-200",
  Hold: "bg-slate-100 text-slate-700 ring-slate-200",
  Processing: "bg-amber-50 text-amber-700 ring-amber-200",
  Approvals: "bg-violet-50 text-violet-700 ring-violet-200",
  Closing: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Funded: "bg-green-50 text-green-700 ring-green-200",
  Terminal: "bg-red-50 text-red-700 ring-red-200",
};

const dotColors: Record<StageGroup, string> = {
  Intake: "bg-blue-500",
  Hold: "bg-slate-400",
  Processing: "bg-amber-500",
  Approvals: "bg-violet-500",
  Closing: "bg-emerald-500",
  Funded: "bg-green-600",
  Terminal: "bg-red-500",
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
