import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
}

export interface StatBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatBar({ stats, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-6">
          <span className="font-medium">{stat.label}</span>
          {index < stats.length - 1 ? (
            <span aria-hidden="true" className="text-border">
              ·
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
