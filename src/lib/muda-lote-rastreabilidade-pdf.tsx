import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type {
  MudaLote,
  MudaEspecie,
  Viveiro,
  MudaFaseEvento,
  MudaLoteInsumo,
  MudaLoteIrrigacao,
  MudaLoteFitossanidade,
  MudaLoteMaoDeObra,
  MudaPedidoVendaItem,
  MudaPedidoVenda,
  Client,
  StockItem,
  Employee,
} from "@prisma/client";
import {
  formatDate,
  faseMudaLabels,
  origemPropaguloLabels,
  mudaFitossanidadeTipoLabels,
} from "./labels";

export type MudaLoteRastreabilidade = MudaLote & {
  especie: MudaEspecie;
  viveiro: Viveiro;
  faseEventos: MudaFaseEvento[];
  insumos: (MudaLoteInsumo & { stockItem: StockItem })[];
  irrigacoes: (MudaLoteIrrigacao & { responsavel: Employee | null })[];
  fitossanidades: (MudaLoteFitossanidade & { responsavel: Employee | null })[];
  maoDeObra: (MudaLoteMaoDeObra & { employee: Employee })[];
  pedidoItens: (MudaPedidoVendaItem & { pedido: MudaPedidoVenda & { cliente: Client } })[];
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9.5, fontFamily: "Helvetica", lineHeight: 1.4, color: "#171717" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 8.5, textAlign: "center", color: "#525252", marginBottom: 18 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 2,
  },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { width: 130, fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  item: { marginBottom: 3 },
  empty: { color: "#a3a3a3", fontStyle: "italic" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: "#a3a3a3",
    textAlign: "center",
  },
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function MudaLoteRastreabilidadeDocument({ lote }: { lote: MudaLoteRastreabilidade }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rastreabilidade do Lote {lote.code}</Text>
        <Text style={styles.subtitle}>Gerado automaticamente em {formatDate(new Date())}</Text>

        <Text style={styles.sectionLabel}>IDENTIFICAÇÃO</Text>
        <Field label="Espécie/Cultivar" value={`${lote.especie.nomePopular}${lote.especie.cultivar ? ` (${lote.especie.cultivar})` : ""}`} />
        <Field label="Viveiro" value={`${lote.viveiro.code} — ${lote.viveiro.name}`} />
        <Field label="Origem do Propágulo" value={origemPropaguloLabels[lote.origemPropagulo] ?? lote.origemPropagulo} />
        <Field label="Data de Semeadura/Estaqueamento" value={formatDate(lote.dataSemeaduraEstaqueamento)} />
        <Field label="Nº Nota/Certificado" value={lote.numeroNotaCertificado || "—"} />
        <Field label="Quantidade Inicial" value={String(lote.quantidadeInicial)} />
        <Field label="Quantidade Atual" value={String(lote.quantidadeAtual)} />
        <Field label="Fase Atual" value={faseMudaLabels[lote.faseAtual] ?? lote.faseAtual} />

        <Text style={styles.sectionLabel}>HISTÓRICO DE FASES</Text>
        {lote.faseEventos.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento registrado.</Text>
        ) : (
          lote.faseEventos.map((e) => (
            <Text key={e.id} style={styles.item}>
              {faseMudaLabels[e.fase] ?? e.fase} — {formatDate(e.dataEntrada)}
              {e.dataSaida ? ` até ${formatDate(e.dataSaida)}` : " (em andamento)"}
              {e.quantidadePerdida ? `, perda de ${e.quantidadePerdida}` : ""}
            </Text>
          ))
        )}

        <Text style={styles.sectionLabel}>INSUMOS CONSUMIDOS</Text>
        {lote.insumos.length === 0 ? (
          <Text style={styles.empty}>Nenhum insumo registrado.</Text>
        ) : (
          lote.insumos.map((i) => (
            <Text key={i.id} style={styles.item}>
              {formatDate(i.data)} — {i.stockItem.name}: {String(i.quantidade)} {i.stockItem.unit || ""}
            </Text>
          ))
        )}

        <Text style={styles.sectionLabel}>IRRIGAÇÃO</Text>
        {lote.irrigacoes.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento registrado.</Text>
        ) : (
          lote.irrigacoes.map((e) => (
            <Text key={e.id} style={styles.item}>
              {formatDate(e.data)}
              {e.metodo ? ` — ${e.metodo}` : ""}
              {e.duracaoMinutos != null ? ` (${e.duracaoMinutos} min)` : ""}
              {e.responsavel ? ` — ${e.responsavel.name}` : ""}
            </Text>
          ))
        )}

        <Text style={styles.sectionLabel}>FITOSSANIDADE</Text>
        {lote.fitossanidades.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento registrado.</Text>
        ) : (
          lote.fitossanidades.map((e) => (
            <Text key={e.id} style={styles.item}>
              {formatDate(e.data)} — {mudaFitossanidadeTipoLabels[e.tipo] ?? e.tipo}
              {e.produtoAplicado ? ` — ${e.produtoAplicado}${e.dosagem ? ` (${e.dosagem})` : ""}` : ""}
              {e.responsavel ? ` — ${e.responsavel.name}` : ""}
            </Text>
          ))
        )}

        <Text style={styles.sectionLabel}>MÃO DE OBRA</Text>
        {lote.maoDeObra.length === 0 ? (
          <Text style={styles.empty}>Nenhum apontamento registrado.</Text>
        ) : (
          lote.maoDeObra.map((a) => (
            <Text key={a.id} style={styles.item}>
              {formatDate(a.data)} — {a.employee.name}: {a.atividade} ({String(a.horasTrabalhadas)}h)
            </Text>
          ))
        )}

        <Text style={styles.sectionLabel}>VENDIDO PARA</Text>
        {lote.pedidoItens.length === 0 ? (
          <Text style={styles.empty}>Ainda não vendido em nenhum pedido.</Text>
        ) : (
          lote.pedidoItens.map((item) => (
            <Text key={item.id} style={styles.item}>
              Pedido {item.pedido.numero} — {item.pedido.cliente.name}: {item.quantidade} mudas em{" "}
              {formatDate(item.pedido.dataPedido)}
            </Text>
          ))
        )}

        <Text style={styles.footer}>
          Documento de rastreabilidade gerado automaticamente pelo JHV Agrosystem a partir dos
          registros do sistema.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderMudaLoteRastreabilidadePdf(lote: MudaLoteRastreabilidade) {
  return renderToBuffer(<MudaLoteRastreabilidadeDocument lote={lote} />);
}
