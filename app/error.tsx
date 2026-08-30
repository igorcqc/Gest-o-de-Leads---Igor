"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
    <h2 className="text-lg font-semibold">Não foi possível carregar esta área</h2>
    <p className="max-w-md text-sm text-muted-foreground">Sua informação permanece salva. Tente novamente; se o problema persistir, saia e entre no CRM.</p>
    <Button onClick={reset}>Tentar novamente</Button>
  </div>;
}
