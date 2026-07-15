export const CADENCIA: Record<string, number | null> = {
  novo: 2,
  em_contato: 3,
  respondeu: 3,
  qualificado: 5,
  proposta: 5,
  negociacao: 3,
  fechado: null,
  perdido: 30,
};

export function calcularProximoFollowup(
  status: string,
  base: Date = new Date()
): Date | null {
  const dias = CADENCIA[status];
  if (dias === null || dias === undefined) return null;
  const prox = new Date(base);
  prox.setDate(prox.getDate() + dias);
  if (prox.getDay() === 0) prox.setDate(prox.getDate() + 1);
  prox.setHours(9, 0, 0, 0);
  return prox;
}
