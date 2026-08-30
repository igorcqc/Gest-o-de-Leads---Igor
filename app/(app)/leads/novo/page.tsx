"use client";

import { useRouter } from "next/navigation";
import { LeadForm, type LeadFormValues } from "@/components/leads/LeadForm";
import { useCreateLead } from "@/hooks/use-leads";

export default function NovoLeadPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateLead();

  function handleSubmit(values: LeadFormValues) {
    mutate(
      values,
      {
        onSuccess: (lead) => {
          router.push(`/leads/${lead.id}`);
        },
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Novo contato</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre uma oportunidade de anúncio, indicação ou prospecção
        </p>
      </div>
      <LeadForm mode="create" onSubmit={handleSubmit} submitting={isPending} />
    </div>
  );
}
