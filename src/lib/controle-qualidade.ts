import type { ControleQualidadeResultado } from "@prisma/client";

// Quando o valor obtido e a faixa aceitável (min/max) estão preenchidos,
// o veredito é calculado — não deixado a critério de seleção manual, que
// é exatamente o tipo de erro humano que um controle de qualidade existe
// para pegar. Retorna null quando não há dados suficientes pra decidir
// (ex: comparação com um CRM sem faixa numérica definida).
export function checkFaixaAceitavel(
  valorObtido: number | null,
  min: number | null,
  max: number | null
): ControleQualidadeResultado | null {
  if (valorObtido === null || min === null || max === null) return null;
  return valorObtido >= min && valorObtido <= max ? "DENTRO_FAIXA" : "FORA_FAIXA";
}
