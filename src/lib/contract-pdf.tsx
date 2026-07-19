import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Contract, Client, Animal, Stall, Piquete, CompanyProfile } from "@prisma/client";
import { MULTA_PCT, JUROS_MENSAL_PCT } from "./boleto-service";
import { formatCurrency, formatDate, contractTypeLabels } from "./labels";

export type ContractWithRelations = Contract & {
  client: Client;
  animal: Animal | null;
  stall: Stall | null;
  piquete: Piquete | null;
};

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", lineHeight: 1.5, color: "#171717" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", color: "#525252", marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  paragraph: { marginBottom: 8, textAlign: "justify" },
  qualification: { marginBottom: 3 },
  bold: { fontFamily: "Helvetica-Bold" },
  signatureBlock: { marginTop: 48, flexDirection: "row", justifyContent: "space-between" },
  signature: { width: "45%", textAlign: "center", borderTopWidth: 1, borderTopColor: "#171717", paddingTop: 4 },
  footer: { position: "absolute", bottom: 30, left: 48, right: 48, fontSize: 8, color: "#a3a3a3", textAlign: "center" },
});

function fullAddress(entity: {
  address?: string | null;
  streetNumber?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}) {
  const parts = [
    entity.address,
    entity.streetNumber ? `nº ${entity.streetNumber}` : null,
    entity.neighborhood,
    entity.city && entity.state ? `${entity.city}/${entity.state}` : entity.city,
    entity.zipCode ? `CEP ${entity.zipCode}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "________________________________________";
}

function objectClause(contract: ContractWithRelations) {
  const animalName = contract.animal?.name || "________________________";

  if (contract.type === "AULAS") {
    return `O presente contrato tem por objeto a prestação de aulas de equitação pela CONTRATADA ao CONTRATANTE e/ou ao animal ${animalName}, nas dependências da CONTRATADA, conforme grade de horários combinada entre as partes.`;
  }

  if (contract.type === "PIQUETE") {
    const code = contract.piquete?.code || "________________________";
    const location = contract.piquete?.location ? ` (${contract.piquete.location})` : "";
    return `O presente contrato tem por objeto a locação do piquete ${code}${location} pela CONTRATADA ao CONTRATANTE, destinado exclusivamente ao alojamento do animal ${animalName}.`;
  }

  const code = contract.stall?.code || "________________________";
  const location = contract.stall?.location ? ` (${contract.stall.location})` : "";
  return `O presente contrato tem por objeto a locação da baia ${code}${location} pela CONTRATADA ao CONTRATANTE, destinada exclusivamente ao alojamento do animal ${animalName}.`;
}

export function ContractDocument({
  contract,
  company,
}: {
  contract: ContractWithRelations;
  company: CompanyProfile | null;
}) {
  const multaPct = Math.round(MULTA_PCT * 100);
  const jurosPct = Math.round(JUROS_MENSAL_PCT * 100);
  const isRental = contract.type === "PIQUETE" || contract.type === "BAIA";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          CONTRATO DE {contractTypeLabels[contract.type].toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>Gerado automaticamente em {formatDate(new Date())}</Text>

        <Text style={styles.sectionLabel}>CONTRATADA</Text>
        <Text style={styles.qualification}>
          <Text style={styles.bold}>{company?.name || "________________________________________"}</Text>
          {company?.cpfCnpj ? `, CPF/CNPJ ${company.cpfCnpj}` : ", CPF/CNPJ ________________________"}
          {company?.phone ? `, telefone ${company.phone}` : ""}
          {company?.email ? `, e-mail ${company.email}` : ""}
          , com endereço em {fullAddress(company ?? {})}.
        </Text>

        <Text style={styles.sectionLabel}>CONTRATANTE</Text>
        <Text style={styles.qualification}>
          <Text style={styles.bold}>{contract.client.name}</Text>
          {contract.client.cpfCnpj
            ? `, CPF/CNPJ ${contract.client.cpfCnpj}`
            : ", CPF/CNPJ ________________________"}
          {contract.client.phone ? `, telefone ${contract.client.phone}` : ""}
          {contract.client.email ? `, e-mail ${contract.client.email}` : ""}
          , com endereço em {fullAddress(contract.client)}.
        </Text>

        <Text style={styles.sectionLabel}>1. OBJETO</Text>
        <Text style={styles.paragraph}>{objectClause(contract)}</Text>

        <Text style={styles.sectionLabel}>2. VALOR E FORMA DE PAGAMENTO</Text>
        <Text style={styles.paragraph}>
          Pelo objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor mensal de{" "}
          <Text style={styles.bold}>{formatCurrency(contract.monthlyValue)}</Text>, com vencimento
          todo dia <Text style={styles.bold}>{contract.dueDay}</Text> de cada mês, a partir de{" "}
          {formatDate(contract.startDate)}.
        </Text>

        <Text style={styles.sectionLabel}>3. ATRASO NO PAGAMENTO</Text>
        <Text style={styles.paragraph}>
          Em caso de não pagamento até a data de vencimento (dia {contract.dueDay}), incidirão sobre o
          valor da parcela em atraso multa de {multaPct}% (moratória) e juros de mora de {jurosPct}% ao
          mês, calculados proporcionalmente aos dias de atraso, sem prejuízo da cobrança do valor
          principal.
        </Text>

        {isRental && (
          <>
            <Text style={styles.sectionLabel}>4. RESPONSABILIDADE PELO ANIMAL</Text>
            <Text style={styles.paragraph}>
              O CONTRATANTE é integralmente responsável pelo animal alojado no{" "}
              {contract.type === "PIQUETE" ? "piquete" : "baia"} objeto deste contrato, incluindo, mas
              não se limitando, à sua alimentação e ao fornecimento de medicamentos e cuidados
              veterinários necessários. A CONTRATADA não se responsabiliza por doenças, acidentes,
              fugas ou óbito do animal decorrentes de sua guarda, salvo em caso de comprovada
              negligência da CONTRATADA.
            </Text>
          </>
        )}

        <Text style={styles.sectionLabel}>{isRental ? "5." : "4."} DISPOSIÇÕES GERAIS</Text>
        <Text style={styles.paragraph}>
          Este contrato vigora por prazo indeterminado a partir da data de início informada, podendo
          ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias. Casos
          omissos serão resolvidos de comum acordo entre as partes.
        </Text>

        {contract.notes && (
          <>
            <Text style={styles.sectionLabel}>{isRental ? "6." : "5."} OBSERVAÇÕES</Text>
            <Text style={styles.paragraph}>{contract.notes}</Text>
          </>
        )}

        <View style={styles.signatureBlock}>
          <Text style={styles.signature}>CONTRATADA{"\n"}{company?.name || ""}</Text>
          <Text style={styles.signature}>CONTRATANTE{"\n"}{contract.client.name}</Text>
        </View>

        <Text style={styles.footer}>
          Contrato-modelo gerado automaticamente pelo JHV Agrosystem. Recomenda-se revisão por um
          advogado antes da assinatura.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderContractPdf(
  contract: ContractWithRelations,
  company: CompanyProfile | null
) {
  return renderToBuffer(<ContractDocument contract={contract} company={company} />);
}
