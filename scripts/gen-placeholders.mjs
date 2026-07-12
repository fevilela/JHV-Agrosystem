import fs from "node:fs";
import path from "node:path";

const groups = [
  {
    label: "Hípica",
    items: [
      ["Controle Diário", "/hipica/controle-diario"],
      ["Treinamento", "/hipica/treinamento"],
      ["Nutrição", "/hipica/nutricao"],
      ["Baia", "/hipica/baia"],
      ["Agenda", "/hipica/agenda"],
      ["Competições", "/hipica/competicoes"],
      ["Transporte", "/hipica/transporte"],
      ["Financeiro da Hípica", "/hipica/financeiro"],
      ["Compra e Venda de Animais", "/hipica/compra-venda"],
    ],
  },
  {
    label: "Pecuária",
    items: [
      ["Cadastro Animal", "/pecuaria/cadastro-animal"],
      ["Reprodução", "/pecuaria/reproducao"],
      ["Sanidade", "/pecuaria/sanidade"],
      ["Pesagens", "/pecuaria/pesagens"],
      ["Pastagens", "/pecuaria/pastagens"],
      ["Nutrição / Confinamento", "/pecuaria/nutricao"],
      ["Manejo", "/pecuaria/manejo"],
      ["Produção de Leite", "/pecuaria/producao-leite"],
    ],
  },
  {
    label: "Agricultura",
    items: [
      ["Talhões", "/agricultura/talhoes"],
      ["Planejamento de Safra", "/agricultura/safra"],
      ["Plantio", "/agricultura/plantio"],
      ["Tratos Culturais", "/agricultura/tratos-culturais"],
      ["Fertilidade", "/agricultura/fertilidade"],
      ["Irrigação", "/agricultura/irrigacao"],
      ["Colheita", "/agricultura/colheita"],
      ["Armazenagem", "/agricultura/armazenagem"],
    ],
  },
  {
    label: "Máquinas e Equipamentos",
    items: [
      ["Cadastro", "/maquinas/cadastro"],
      ["Controle de Uso", "/maquinas/controle"],
      ["Manutenções", "/maquinas/manutencoes"],
    ],
  },
  {
    label: "Estoque",
    items: [
      ["Materiais e Insumos", "/estoque/materiais"],
      ["Lotes e Validade", "/estoque/lotes"],
    ],
  },
  {
    label: "Compras",
    items: [
      ["Solicitações", "/compras/solicitacoes"],
      ["Cotações", "/compras/cotacoes"],
      ["Pedidos", "/compras/pedidos"],
    ],
  },
  {
    label: "Financeiro",
    items: [
      ["Fluxo de Caixa", "/financeiro/fluxo-caixa"],
      ["Contas a Pagar", "/financeiro/contas-pagar"],
      ["Contas a Receber", "/financeiro/contas-receber"],
      ["Centro de Custos", "/financeiro/centro-custos"],
    ],
  },
  {
    label: "Recursos Humanos",
    items: [
      ["Funcionários", "/rh/funcionarios"],
      ["Ponto e Escalas", "/rh/ponto"],
      ["Treinamentos e EPIs", "/rh/treinamentos"],
    ],
  },
  {
    label: "Oficina",
    items: [
      ["Ordens de Serviço", "/oficina/ordens-servico"],
      ["Peças e Mecânicos", "/oficina/pecas"],
    ],
  },
];

const appDir = path.join(process.cwd(), "src", "app", "(app)");

for (const group of groups) {
  for (const [title, href] of group.items) {
    const dir = path.join(appDir, ...href.split("/").filter(Boolean));
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, "page.tsx");
    const content = `import { ModulePlaceholder } from "@/components/placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="${title}"
      description="Módulo ${group.label} — em desenvolvimento nas próximas etapas."
    />
  );
}
`;
    fs.writeFileSync(filePath, content, "utf8");
    console.log("criado:", filePath);
  }
}
