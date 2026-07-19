"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { competitionFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createCompetitionAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(competitionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.name) return { error: "Informe o nome da competição." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.competition.create({
    data: { ...data, organizationId } as Prisma.CompetitionUncheckedCreateInput,
  });

  revalidatePath("/hipica/competicoes");
  redirect("/hipica/competicoes");
}

export async function updateCompetitionAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(competitionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.name) return { error: "Informe o nome da competição." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.competition.updateMany({
    where: { id, organizationId },
    data: data as Prisma.CompetitionUncheckedUpdateInput,
  });

  revalidatePath("/hipica/competicoes");
  redirect("/hipica/competicoes");
}

export async function deleteCompetitionAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.competition.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/competicoes");
}
