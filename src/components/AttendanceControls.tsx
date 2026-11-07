import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMyPlayer } from "@/hooks/useMyPlayer";
import { supabase } from "@/integrations/supabase/client";
import {
  ATTENDANCE_LABEL,
  ATTENDANCE_STATUS,
  attendanceQuery,
  playersQuery,
  type Training,
} from "@/lib/club";

function useSetAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { trainingId: string; playerId: string; status: string }) => {
      const { error } = await supabase
        .from("training_attendance")
        .upsert(
          { training_id: v.trainingId, player_id: v.playerId, status: v.status },
          { onConflict: "training_id,player_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training_attendance"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function AttendanceControls({ training }: { training: Training }) {
  const { isStaff } = useAuth();
  const myPlayer = useMyPlayer();
  const { data: attendance = [] } = useQuery(attendanceQuery);
  const setAttendance = useSetAttendance();

  const rows = attendance.filter((a) => a.training_id === training.id);
  const count = (s: string) => rows.filter((a) => a.status === s).length;
  const mine = myPlayer ? rows.find((a) => a.player_id === myPlayer.id) : undefined;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
      <Badge variant="outline" className="border-success/60 text-success">
        {count("presente")} presentes
      </Badge>
      <Badge variant="outline">{count("duvida")} dúvidas</Badge>
      <Badge variant="outline" className="border-primary/60 text-primary">
        {count("ausente")} ausentes
      </Badge>

      {myPlayer && (
        <div className="ml-auto flex gap-1">
          {ATTENDANCE_STATUS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={mine?.status === s ? "default" : "outline"}
              onClick={() =>
                setAttendance.mutate({
                  trainingId: training.id,
                  playerId: myPlayer.id,
                  status: s,
                })
              }
            >
              {ATTENDANCE_LABEL[s]}
            </Button>
          ))}
        </div>
      )}

      {isStaff && <AttendanceSheet training={training} />}
    </div>
  );
}

function AttendanceSheet({ training }: { training: Training }) {
  const [open, setOpen] = useState(false);
  const { data: players = [] } = useQuery(playersQuery);
  const { data: attendance = [] } = useQuery(attendanceQuery);
  const setAttendance = useSetAttendance();

  const list = players.filter((p) => p.categoria === training.categoria);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="ml-auto">
          Chamada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Chamada · {training.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {list.map((p) => {
            const row = attendance.find(
              (a) => a.training_id === training.id && a.player_id === p.id,
            );
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 px-3 py-2"
              >
                <p className="min-w-0 flex-1 truncate text-sm">{p.full_name}</p>
                {ATTENDANCE_STATUS.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={row?.status === s ? "default" : "outline"}
                    onClick={() =>
                      setAttendance.mutate({
                        trainingId: training.id,
                        playerId: p.id,
                        status: s,
                      })
                    }
                  >
                    {ATTENDANCE_LABEL[s]}
                  </Button>
                ))}
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum atleta nesta categoria ({training.categoria}).
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
