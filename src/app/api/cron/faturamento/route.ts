import { NextRequest, NextResponse } from "next/server";
import { processarRecorrencias, reemitirBoletosAtrasados } from "@/lib/boleto-service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const recorrencias = await processarRecorrencias();
  const reemissoes = await reemitirBoletosAtrasados();

  return NextResponse.json({ recorrencias, reemissoes });
}
