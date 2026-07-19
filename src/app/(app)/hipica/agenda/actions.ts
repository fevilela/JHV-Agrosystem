"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, AgendaEventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { agendaFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createAgendaAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(agendaFields, formData);
  if (!data.title) return { error: "Informe o título do evento." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.agendaEvent.create({
    data: { ...data, organizationId } as Prisma.AgendaEventUncheckedCreateInput,
  });

  revalidatePath("/hipica/agenda");
  redirect("/hipica/agenda");
}

export async function updateAgendaAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(agendaFields, formData);
  if (!data.title) return { error: "Informe o título do evento." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.agendaEvent.updateMany({
    where: { id, organizationId },
    data: data as Prisma.AgendaEventUncheckedUpdateInput,
  });

  revalidatePath("/hipica/agenda");
  redirect("/hipica/agenda");
}

export async function deleteAgendaAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.agendaEvent.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/agenda");
}

export async function setAgendaStatusAction(
  id: string,
  status: AgendaEventStatus
) {
  const { organizationId } = await requireModule("hipica");
  await prisma.agendaEvent.updateMany({ where: { id, organizationId }, data: { status } });
  revalidatePath("/hipica/agenda");
}
