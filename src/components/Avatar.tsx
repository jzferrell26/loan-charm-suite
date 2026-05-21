import { avatarColor, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-white font-medium",
        avatarColor(name),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name) || "?"}
    </div>
  );
}
