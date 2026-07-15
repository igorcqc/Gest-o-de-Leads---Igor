"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSoftDeleteLead } from "@/hooks/use-leads";

export function DeleteLeadButton({ leadId, leadNome }: { leadId: string; leadNome: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useSoftDeleteLead();

  return (
    <>
      <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> Apagar lead
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja apagar &quot;{leadNome}&quot;? O lead será movido para a
              lixeira e poderá ser restaurado depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                mutate(leadId, {
                  onSuccess: () => router.push("/leads"),
                })
              }
            >
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
