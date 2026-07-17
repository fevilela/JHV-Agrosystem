import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function BalancoPatrimonialPage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, type: { in: ["ATIVO", "PASSIVO", "PATRIMONIO_LIQUIDO"] } },
    orderBy: { code: "asc" },
    include: { lines: true },
  });

  const rows = accounts
    .map((a) => {
      const totalDebito = a.lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + Number(l.amount), 0);
      const totalCredito = a.lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + Number(l.amount), 0);
      const saldo = calcularSaldo(a.nature, totalDebito, totalCredito);
      return { ...a, saldo };
    })
    .filter((r) => r.saldo !== 0);

  const ativo = rows.filter((r) => r.type === "ATIVO");
  const passivo = rows.filter((r) => r.type === "PASSIVO");
  const patrimonioLiquido = rows.filter((r) => r.type === "PATRIMONIO_LIQUIDO");

  const totalAtivo = ativo.reduce((s, r) => s + r.saldo, 0);
  const totalPassivo = passivo.reduce((s, r) => s + r.saldo, 0);
  const totalPL = patrimonioLiquido.reduce((s, r) => s + r.saldo, 0);
  const totalPassivoPL = totalPassivo + totalPL;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Balanço Patrimonial</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Posição patrimonial acumulada desde o início dos lançamentos.
      </p>

      <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Este balanço mostra só as contas de Ativo, Passivo e Patrimônio Líquido. Para fechar
        certinho (Ativo = Passivo + PL), o resultado apurado na DRE do período precisa ser lançado
        manualmente em &quot;Lucros/Prejuízos Acumulados&quot; ao final do exercício — isso é
        trabalho de encerramento contábil, normalmente feito junto com um contador.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-700">Ativo</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {ativo.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-neutral-400">Sem saldo.</td>
                </tr>
              )}
              {ativo.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
                <td className="px-4 py-3">Total do Ativo</td>
                <td className="px-4 py-3 text-right">{formatCurrency(totalAtivo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-700">Passivo + Patrimônio Líquido</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {passivo.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo)}</td>
                </tr>
              ))}
              {patrimonioLiquido.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo)}</td>
                </tr>
              ))}
              {passivo.length === 0 && patrimonioLiquido.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-sm text-neutral-400">
                    Sem saldo.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
                <td className="px-4 py-3">Total Passivo + PL</td>
                <td className="px-4 py-3 text-right">{formatCurrency(totalPassivoPL)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        Diferença Ativo − (Passivo + PL): <strong>{formatCurrency(totalAtivo - totalPassivoPL)}</strong>
      </p>
    </div>
  );
}
