import { supabase } from "@/integrations/supabase/client";

export const DOCS_BUCKET = "club-docs";

/** Envia um documento e devolve o caminho salvo no storage privado. */
export async function uploadDoc(file: File, folder = "geral") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(DOCS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** URL assinada temporária para abrir o documento. */
export async function signedDocUrl(path: string) {
  const { data, error } = await supabase.storage.from(DOCS_BUCKET).createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}
