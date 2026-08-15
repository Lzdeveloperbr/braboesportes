import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-soft", 
        className
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="relative z-10 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">{label}</p>
          <p className="font-display text-3xl leading-none tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground/60">{hint}</p>}
        </div>
        {/* Subtle background glow on hover */}
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
      </CardContent>
    </Card>
  );
}
