export const exerciseTypeLabels: Record<string, string> = {
  EXERCICIO_GERAL: "Exercício Geral",
  SALTO: "Salto",
  TAMBOR: "Tambor",
  MARCHA: "Marcha",
  CORRIDA: "Corrida",
  ADESTRAMENTO: "Adestramento",
  OUTRO: "Outro",
};

export const intensityLabels: Record<string, string> = {
  LEVE: "Leve",
  MODERADA: "Moderada",
  INTENSA: "Intensa",
};

export const stallStatusLabels: Record<string, string> = {
  LIVRE: "Livre",
  OCUPADA: "Ocupada",
  LIMPEZA: "Limpeza",
  MANUTENCAO: "Manutenção",
};

export const stallEventTypeLabels: Record<string, string> = {
  OCUPACAO: "Ocupação",
  DESOCUPACAO: "Desocupação",
  LIMPEZA: "Limpeza",
  MANUTENCAO: "Manutenção",
  TROCA: "Troca de animal",
};

export const piqueteStatusLabels: Record<string, string> = {
  LIVRE: "Livre",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
};

export const piqueteEventTypeLabels: Record<string, string> = {
  OCUPACAO: "Ocupação",
  DESOCUPACAO: "Desocupação",
  MANUTENCAO: "Manutenção",
  TROCA: "Troca de animal",
};

export const contractTypeLabels: Record<string, string> = {
  AULAS: "Aulas na Hípica",
  PIQUETE: "Aluguel de Piquete",
  BAIA: "Aluguel de Baia",
};

export const agendaEventTypeLabels: Record<string, string> = {
  FERRADOR: "Ferrador",
  VETERINARIO: "Veterinário",
  VACINA: "Vacina",
  COMPETICAO: "Competição",
  TRANSPORTE: "Transporte",
  OUTRO: "Outro",
};

export const agendaEventStatusLabels: Record<string, string> = {
  AGENDADO: "Agendado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const financialEntryTypeLabels: Record<string, string> = {
  MENSALIDADE: "Mensalidade",
  HOSPEDAGEM: "Hospedagem",
  TREINAMENTO: "Treinamento",
  VETERINARIO: "Veterinário",
  MEDICAMENTO: "Medicamento",
  OUTRO: "Outro",
};

export const financialEntryStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

export const animalTransactionTypeLabels: Record<string, string> = {
  COMPRA: "Compra",
  VENDA: "Venda",
  LEILAO: "Leilão",
};

export const livestockCategoryLabels: Record<string, string> = {
  CORTE: "Corte",
  LEITE: "Leite",
  CONFINAMENTO: "Confinamento",
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  REPRODUTOR: "Reprodutor",
  OUTRO: "Outro",
};

export const livestockStatusLabels: Record<string, string> = {
  ATIVO: "Ativo",
  VENDIDO: "Vendido",
  ABATIDO: "Abatido",
  OBITO: "Óbito",
  INATIVO: "Inativo",
};

export const animalSexoLabels: Record<string, string> = {
  MACHO: "Macho",
  FEMEA: "Fêmea",
  CASTRADO: "Castrado",
};

export const pastureRotationStatusLabels: Record<string, string> = {
  EM_USO: "Em uso",
  DESCANSO: "Descanso",
};

export const reproductionMethodLabels: Record<string, string> = {
  IA: "Inseminação Artificial",
  MONTA_NATURAL: "Monta Natural",
};

export const diagnosisResultLabels: Record<string, string> = {
  PRENHE: "Prenhe",
  VAZIA: "Vazia",
  INDEFINIDO: "Indefinido",
};

export const healthRecordTypeLabels: Record<string, string> = {
  VACINA_BRUCELOSE: "Vacina Brucelose",
  VACINA_AFTOSA: "Vacina Aftosa",
  CARRAPATICIDA: "Carrapaticida",
  VERMIFUGO: "Vermífugo",
  TRATAMENTO: "Tratamento",
  OUTRO: "Outro",
};

export const equineHealthRecordTypeLabels: Record<string, string> = {
  MEDICAMENTO: "Medicamento",
  VACINA: "Vacina",
  SORO: "Soro",
  VERMIFUGO: "Vermífugo",
  FERRADURA: "Troca de Ferradura",
  CASQUEAMENTO: "Casqueamento",
  OUTRO: "Outro",
};

export const milkShiftLabels: Record<string, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
};

export const feedingTypeLabels: Record<string, string> = {
  PASTO: "Pasto",
  CONFINAMENTO: "Confinamento",
  SEMI_CONFINAMENTO: "Semi Confinamento",
};

export const managementMovementTypeLabels: Record<string, string> = {
  MOVIMENTACAO: "Movimentação",
  EMBARQUE: "Embarque",
  COMPRA: "Compra",
  VENDA: "Venda",
};

export const safraStatusLabels: Record<string, string> = {
  PLANEJADA: "Planejada",
  EM_ANDAMENTO: "Em Andamento",
  COLHIDA: "Colhida",
  CANCELADA: "Cancelada",
};

export const tratoCulturalTypeLabels: Record<string, string> = {
  ADUBACAO: "Adubação",
  PULVERIZACAO: "Pulverização",
  HERBICIDA: "Herbicida",
  INSETICIDA: "Inseticida",
  FUNGICIDA: "Fungicida",
  OUTRO: "Outro",
};

export const fertilityTypeLabels: Record<string, string> = {
  ANALISE_SOLO: "Análise de Solo",
  CALAGEM: "Calagem",
  GESSAGEM: "Gessagem",
  CORRECAO: "Correção",
  OUTRO: "Outro",
};

export const storageTypeLabels: Record<string, string> = {
  SILO: "Silo",
  ARMAZEM: "Armazém",
};

export const storageMovementTypeLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  QUEBRA: "Quebra",
};

export const machineTypeLabels: Record<string, string> = {
  TRATOR: "Trator",
  COLHEITADEIRA: "Colheitadeira",
  PULVERIZADOR: "Pulverizador",
  CAMINHAO: "Caminhão",
  IMPLEMENTO: "Implemento",
  CARRETA: "Carreta",
  OUTRO: "Outro",
};

export const machineStatusLabels: Record<string, string> = {
  ATIVO: "Ativo",
  MANUTENCAO: "Em Manutenção",
  INATIVO: "Inativo",
  VENDIDO: "Vendido",
};

export const maintenanceTypeLabels: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  TROCA_OLEO: "Troca de Óleo",
  TROCA_PNEU: "Troca de Pneu",
  LUBRIFICACAO: "Lubrificação",
  OUTRO: "Outro",
};

export const stockCategoryLabels: Record<string, string> = {
  MEDICAMENTO: "Medicamento",
  INSUMO: "Insumo",
  RACAO: "Ração",
  FERRAMENTA: "Ferramenta",
  PECA: "Peça",
  COMBUSTIVEL: "Combustível",
  EPI: "EPI",
  MATERIAL: "Material",
  OUTRO: "Outro",
};

export const stockBatchStatusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  CONSUMIDO: "Consumido",
};

export const purchaseRequestStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  ATENDIDA: "Atendida",
};

export const quotationStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
};

export const purchaseOrderStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const financeEntryStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

export const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
  CHEQUE: "Cheque",
  DINHEIRO: "Dinheiro",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
};

export const attendanceStatusLabels: Record<string, string> = {
  PRESENTE: "Presente",
  FALTA: "Falta",
  ATESTADO: "Atestado",
  FERIAS: "Férias",
  FOLGA: "Folga",
};

export const scheduleShiftLabels: Record<string, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
  INTEGRAL: "Integral",
  FOLGA: "Folga",
};

export const serviceOrderStatusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const chartAccountTypeLabels: Record<string, string> = {
  ATIVO: "Ativo",
  PASSIVO: "Passivo",
  PATRIMONIO_LIQUIDO: "Patrimônio Líquido",
  RECEITA: "Receita",
  CUSTO: "Custo",
  DESPESA: "Despesa",
};

export const chartAccountNatureLabels: Record<string, string> = {
  DEVEDORA: "Devedora",
  CREDORA: "Credora",
};

export const journalEntryLineTypeLabels: Record<string, string> = {
  DEBITO: "Débito",
  CREDITO: "Crédito",
};

export const propagacaoTipoLabels: Record<string, string> = {
  SEMENTE: "Semente",
  ESTACA: "Estaca",
  MUDA_MICROPROPAGADA: "Muda Micropropagada",
  ENXERTIA: "Enxertia",
  ALPORQUIA: "Alporquia",
  OUTRO: "Outro",
};

export const coberturaTipoLabels: Record<string, string> = {
  SOMBRITE: "Sombrite",
  PLASTICO: "Plástico",
  CASA_VEGETACAO: "Casa de Vegetação",
  CEU_ABERTO: "Céu Aberto",
  OUTRO: "Outro",
};

export const origemPropaguloLabels: Record<string, string> = {
  SEMENTEIRA_PROPRIA: "Sementeira Própria",
  COMPRADO: "Comprado",
  DOADO: "Doado",
};

export const mudaLoteStatusLabels: Record<string, string> = {
  ATIVO: "Ativo",
  DESCARTADO: "Descartado",
  VENDIDO: "Vendido",
  DOADO: "Doado",
  PERDIDO: "Perdido",
};

export const faseMudaLabels: Record<string, string> = {
  SEMEADURA_ESTAQUEAMENTO: "Semeadura/Estaqueamento",
  GERMINACAO_ENRAIZAMENTO: "Germinação/Enraizamento",
  REPICAGEM: "Repicagem",
  CRESCIMENTO: "Crescimento",
  RUSTIFICACAO: "Rustificação",
  PRONTA_EXPEDICAO: "Pronta para Expedição",
};

export function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

// Mesma ideia do toOptions, mas pra quando o rótulo precisa vir traduzido
// (`t` já escopado pro namespace `labels.<mapa>` certo, ex: getTranslations("labels.stockCategory")).
// O dict PT só serve aqui como fonte das CHAVES do enum, não do texto exibido.
export function toOptionsFromKeys(labels: Record<string, string>, t: (key: string) => string) {
  return Object.keys(labels).map((value) => ({ value, label: t(value) }));
}

// `currency` é só o código de EXIBIÇÃO (símbolo/formato) escolhido pela
// organização em Configurações > Empresa — não converte o valor numérico.
// O padrão continua BRL: cobrança via boleto/Mercado Pago só existe em
// reais mesmo, então em qualquer tela que lide com boleto o valor real
// segue sendo BRL independente do que passar aqui.
export function formatCurrency(value: unknown, locale: string = "pt-BR", currency: string = "BRL") {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(locale, { style: "currency", currency });
}

export function formatDate(value: unknown, locale: string = "pt-BR") {
  if (!value) return "—";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { timeZone: "UTC" });
}
