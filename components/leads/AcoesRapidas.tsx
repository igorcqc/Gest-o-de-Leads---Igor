import { MessageCircle, AtSign, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function AcoesRapidas({
  telefone,
  instagramHandle,
}: {
  telefone: string | null;
  instagramHandle: string | null;
}) {
  const whatsappUrl = telefone
    ? `https://wa.me/55${onlyDigits(telefone)}`
    : null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle.replace(/^@/, "")}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" className="justify-start" disabled={!whatsappUrl} asChild={Boolean(whatsappUrl)}>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> Abrir WhatsApp
            </a>
          ) : (
            <span>
              <MessageCircle className="size-4" /> Abrir WhatsApp
            </span>
          )}
        </Button>
        <Button variant="outline" className="justify-start" disabled={!instagramUrl} asChild={Boolean(instagramUrl)}>
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              <AtSign className="size-4" /> Abrir Instagram
            </a>
          ) : (
            <span>
              <AtSign className="size-4" /> Abrir Instagram
            </span>
          )}
        </Button>
        <Button variant="outline" className="justify-start" disabled={!telefone} asChild={Boolean(telefone)}>
          {telefone ? (
            <a href={`tel:${onlyDigits(telefone)}`}>
              <Phone className="size-4" /> Ligar
            </a>
          ) : (
            <span>
              <Phone className="size-4" /> Ligar
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
