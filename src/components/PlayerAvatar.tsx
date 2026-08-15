import { useQuery } from "@tanstack/react-query";

import { signedPhotoUrl } from "@/lib/photos";
import { cn } from "@/lib/utils";

type Props = {
  path: string | null;
  name: string;
  shirt?: number | null;
  className?: string;
};

/** Avatar do atleta com URL assinada; cai para a camisa/iniciais quando não há foto. */
export function PlayerAvatar({ path, name, shirt, className }: Props) {
  const { data: url } = useQuery({
    queryKey: ["photo", path],
    queryFn: () => signedPhotoUrl(path),
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
  });

  const fallback = shirt != null ? String(shirt) : name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-display text-2xl text-primary ring-1 ring-primary/20 shadow-elevated transition-transform hover:scale-105",
        "h-12 w-12",
        className,
      )}
    >
      {url ? (
        <img src={url} alt={`Foto de ${name}`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </span>
  );
}
