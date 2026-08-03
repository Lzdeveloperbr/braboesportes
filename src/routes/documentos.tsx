import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import {
  documentsQuery,
  DOC_TYPES,
  DOC_TYPE_LABEL,
  formatDay,
  playersQuery,
} from "@/lib/club";
import { signedDocUrl, uploadDoc } from "@/lib/docs";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Contratos, exames médicos e autorizações dos atletas do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Documentos | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Arquivo digital seguro de contratos, exames e autorizações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentosPage,
});

function DocumentosPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: docs = [] } = useQuery(documentsQuery);
  const { data: players = [] } = useQuery(playersQuery);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("contrato");
  const [playerId, setPlayerId] = useState("none");
  const [expires, setExpires] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Selecione um arquivo");
      const path = await uploadDoc(file, docType);
      const { error } = await supabase.from("documents").insert({
        title,
        doc_type: docType,
        file_path: path,
        player_id: playerId === "none" ? null : playerId,
        expires_on: expires || null,
      });
      if (error) throw error;
      await logAudit("upload", "documents", null, { title });
    },
    onSuccess: () => {
      toast.success("Documento enviado");
      setTitle("");
      setFile(null);
      setExpires("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openDoc = async (path: string) => {
    try {
      const url = await signedDocUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const isExpiring = (iso: string | null) => {
    if (!iso) return false;
    const days = (new Date(iso + "T12:00:00").getTime() - Date.now()) / 86400000;
    return days < 30;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Documentos</h1>
            <p className="text-sm text-muted-foreground">
              Contratos, exames e autorizações em arquivo seguro.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Enviar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Título</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOC_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {DOC_TYPE_LABEL[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Validade</Label>
                      <Input
                        type="date"
                        value={expires}
                        onChange={(e) => setExpires(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Atleta</Label>
                    <Select value={playerId} onValueChange={setPlayerId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Documento do clube</SelectItem>
                        {players.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Arquivo</Label>
                    <Input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!title || !file || create.isPending}
                    onClick={() => create.mutate()}
                  >
                    {create.isPending ? "Enviando..." : "Salvar documento"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map((d) => {
            const player = players.find((p) => p.id === d.player_id);
            return (
              <Card key={d.id} className="border-border/60 bg-card/80 shadow-elevated">
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type}
                      {player ? ` · ${player.full_name}` : " · Clube"}
                    </p>
                    {d.expires_on && (
                      <Badge
                        variant="outline"
                        className={
                          isExpiring(d.expires_on)
                            ? "mt-2 border-primary/60 text-primary"
                            : "mt-2 border-border"
                        }
                      >
                        {isExpiring(d.expires_on) && <AlertTriangle className="mr-1 h-3 w-3" />}
                        Vence {formatDay(d.expires_on)}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openDoc(d.file_path)}>
                    Abrir
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {docs.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum documento disponível.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
