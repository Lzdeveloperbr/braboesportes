import { formationSlots, type Player } from "@/lib/club";
import { cn } from "@/lib/utils";

type Props = {
  formation: string;
  starters: Player[];
  className?: string;
};

/** Campo tático com os titulares posicionados conforme a formação escolhida. */
export function TacticalPitch({ formation, starters, className }: Props) {
  const slots = formationSlots(formation);

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border/60",
        "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--color-success)_22%,transparent),transparent_70%)]",
        "bg-success/10",
        className,
      )}
    >
      {/* Linhas do campo */}
      <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-foreground/15" />
      <div className="pointer-events-none absolute inset-x-3 top-1/2 h-px bg-foreground/15" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/15" />
      <div className="pointer-events-none absolute inset-x-1/4 top-3 h-[14%] border-2 border-t-0 border-foreground/15" />
      <div className="pointer-events-none absolute inset-x-1/4 bottom-3 h-[14%] border-2 border-b-0 border-foreground/15" />

      {slots.map((slot, i) => {
        const p = starters[i];
        return (
          <div
            key={i}
            className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border font-display text-lg shadow-elevated transition-transform",
                p
                  ? "border-primary/60 bg-primary text-primary-foreground hover:scale-110"
                  : "border-dashed border-foreground/25 bg-background/50 text-muted-foreground",
              )}
            >
              {p ? (p.shirt_number ?? "-") : i + 1}
            </span>
            <span className="max-w-full truncate text-[10px] font-medium text-foreground/90">
              {p ? p.full_name.split(" ")[0] : "Vago"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
