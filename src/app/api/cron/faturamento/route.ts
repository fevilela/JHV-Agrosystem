import { NextRequest, NextResponse } from "next/server";
import {
  processarRecorrenciasTodasOrganizacoes,
  reemitirBoletosAtrasadosTodasOrganizacoes,
} from "@/lib/boleto-service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const recorrencias = await processarRecorrenciasTodasOrganizacoes();
  const reemissoes = await reemitirBoletosAtrasadosTodasOrganizacoes();

  return NextResponse.json({ recorrencias, reemissoes });
}
