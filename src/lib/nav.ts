export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  key: string;
  label: string;
  href?: string;
  items?: NavItem[];
};

/** Grupos que ficam sempre visíveis, independente de allowedModules (base usada pelos outros módulos). */
export const ALWAYS_ON_MODULES = ["cadastro", "configuracoes"];

/** Módulos que já têm isolamento de dados por organização e podem ser liberados no /admin. */
export const RETROFITTED_MODULES = [
  "cadastro",
  "hipica",
  "estoque",
  "maquinas",
  "oficina",
  "compras",
  "rh",
  "contabilidade",
  "financeiro",
  "agricultura",
  "pecuaria",
];

export const navGroups: NavGroup[] = [
  {
    key: "cadastro",
    label: "Cadastro",
    items: [
      { label: "Propriedades", href: "/cadastro/propriedades" },
      { label: "Proprietários", href: "/cadastro/proprietarios" },
      { label: "Animais / Cavalos", href: "/cadastro/animais" },
      { label: "Funcionários", href: "/cadastro/funcionarios" },
      { label: "Veterinários", href: "/cadastro/veterinarios" },
      { label: "Ferradores", href: "/cadastro/ferradores" },
      { label: "Instrutores", href: "/cadastro/instrutores" },
      { label: "Tratadores", href: "/cadastro/tratadores" },
      { label: "Clientes", href: "/cadastro/clientes" },
      { label: "Fornecedores", href: "/cadastro/fornecedores" },
    ],
  },
  {
    key: "hipica",
    label: "Hípica",
    items: [
      { label: "Controle Diário / Treinamento", href: "/hipica/treinamento" },
      { label: "Nutrição", href: "/hipica/nutricao" },
      { label: "Sanidade", href: "/hipica/sanidade" },
      { label: "Baia", href: "/hipica/baia" },
      { label: "Piquetes", href: "/hipica/piquetes" },
      { label: "Agenda", href: "/hipica/agenda" },
      { label: "Competições", href: "/hipica/competicoes" },
      { label: "Transporte", href: "/hipica/transporte" },
      { label: "Financeiro da Hípica", href: "/hipica/financeiro" },
      { label: "Compra e Venda de Animais", href: "/hipica/compra-venda" },
      { label: "Contratos", href: "/hipica/contratos" },
    ],
  },
  {
    key: "pecuaria",
    label: "Pecuária",
    items: [
      { label: "Cadastro Animal", href: "/pecuaria/cadastro-animal" },
      { label: "Reprodução", href: "/pecuaria/reproducao" },
      { label: "Sanidade", href: "/pecuaria/sanidade" },
      { label: "Pesagens", href: "/pecuaria/pesagens" },
      { label: "Pastagens", href: "/pecuaria/pastagens" },
      { label: "Nutrição / Confinamento", href: "/pecuaria/nutricao" },
      { label: "Manejo", href: "/pecuaria/manejo" },
      { label: "Produção de Leite", href: "/pecuaria/producao-leite" },
    ],
  },
  {
    key: "agricultura",
    label: "Agricultura",
    items: [
      { label: "Talhões", href: "/agricultura/talhoes" },
      { label: "Planejamento de Safra", href: "/agricultura/safra" },
      { label: "Plantio", href: "/agricultura/plantio" },
      { label: "Tratos Culturais", href: "/agricultura/tratos-culturais" },
      { label: "Fertilidade", href: "/agricultura/fertilidade" },
      { label: "Irrigação", href: "/agricultura/irrigacao" },
      { label: "Colheita", href: "/agricultura/colheita" },
      { label: "Armazenagem", href: "/agricultura/armazenagem" },
    ],
  },
  {
    key: "maquinas",
    label: "Máquinas e Equipamentos",
    items: [
      { label: "Cadastro", href: "/maquinas/cadastro" },
      { label: "Controle de Uso", href: "/maquinas/controle" },
      { label: "Manutenções", href: "/maquinas/manutencoes" },
    ],
  },
  {
    key: "estoque",
    label: "Estoque",
    items: [
      { label: "Materiais e Insumos", href: "/estoque/materiais" },
      { label: "Lotes e Validade", href: "/estoque/lotes" },
    ],
  },
  {
    key: "compras",
    label: "Compras",
    items: [
      { label: "Solicitações", href: "/compras/solicitacoes" },
      { label: "Cotações", href: "/compras/cotacoes" },
      { label: "Pedidos", href: "/compras/pedidos" },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    items: [
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa" },
      { label: "Contas a Pagar", href: "/financeiro/contas-pagar" },
      { label: "Contas a Receber", href: "/financeiro/contas-receber" },
      { label: "Cobranças Recorrentes", href: "/financeiro/recorrentes" },
      { label: "Centro de Custos", href: "/financeiro/centro-custos" },
    ],
  },
  {
    key: "contabilidade",
    label: "Contabilidade",
    items: [
      { label: "Plano de Contas", href: "/contabilidade/plano-contas" },
      { label: "Lançamentos Contábeis", href: "/contabilidade/lancamentos" },
      { label: "Livro Razão", href: "/contabilidade/razao" },
      { label: "Balancete de Verificação", href: "/contabilidade/balancete" },
      { label: "Balanço Patrimonial", href: "/contabilidade/balanco" },
      { label: "DRE", href: "/contabilidade/dre" },
    ],
  },
  {
    key: "rh",
    label: "Recursos Humanos",
    items: [
      { label: "Funcionários", href: "/rh/funcionarios" },
      { label: "Ponto e Escalas", href: "/rh/ponto" },
      { label: "Treinamentos e EPIs", href: "/rh/treinamentos" },
    ],
  },
  {
    key: "oficina",
    label: "Oficina",
    items: [
      { label: "Ordens de Serviço", href: "/oficina/ordens-servico" },
      { label: "Peças e Mecânicos", href: "/oficina/pecas" },
    ],
  },
  {
    key: "configuracoes",
    label: "Configurações",
    items: [
      { label: "Dados da Empresa", href: "/configuracoes/empresa" },
      { label: "Conectar WhatsApp", href: "/configuracoes/whatsapp" },
      { label: "Conversas WhatsApp", href: "/configuracoes/whatsapp/conversas" },
      { label: "Log de Auditoria", href: "/configuracoes/auditoria" },
    ],
  },
];
