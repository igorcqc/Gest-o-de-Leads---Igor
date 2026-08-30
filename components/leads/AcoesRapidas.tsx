import { MessageCircle, AtSign, Phone, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function AcoesRapidas({
  telefone,
  instagramHandle,
  nome,
}: {
  telefone: string | null;
  instagramHandle: string | null;
  nome: string;
}) {
  const whatsappUrl = telefone
    ? `https://wa.me/55${onlyDigits(telefone)}`
    : null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle.replace(/^@/, "")}`
    : null;
  const firstName = nome.trim().split(/\s+/)[0] || "tudo bem";
  const templates = [
    { label: "1ª abordagem", text: `Olá, ${firstName}! Tudo bem? Vi seu contato e queria entender melhor o que você está buscando. Posso te fazer algumas perguntas rápidas?` },
    { label: "Follow-up 1", text: `Olá, ${firstName}! Passando para saber se conseguiu ver minha mensagem. Posso te ajudar com alguma informação?` },
    { label: "Follow-up 2", text: `${firstName}, sei que a rotina é corrida. Se ainda fizer sentido conversar sobre isso, me responda por aqui e continuamos.` },
    { label: "Reativação", text: `Olá, ${firstName}! Retomando nosso contato: esse assunto ainda é uma prioridade para você neste momento?` },
  ];

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
        {telefone && (
          <div className="mt-2 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cadência manual</p>
            <div className="grid grid-cols-1 gap-2">
              {templates.map((template) => (
                <Button key={template.label} variant="ghost" size="sm" className="justify-start" asChild>
                  <a
                    href={`https://wa.me/55${onlyDigits(telefone)}?text=${encodeURIComponent(template.text)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send className="size-3.5" /> {template.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
