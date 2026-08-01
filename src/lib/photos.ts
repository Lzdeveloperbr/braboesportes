import { supabase } from "@/integrations/supabase/client";

export const PHOTO_BUCKET = "player-photos";

/** Envia a foto e devolve o caminho salvo no storage. */
export async function uploadPhoto(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** URL assinada temporária para exibir a foto (bucket privado). */
export async function signedPhotoUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
