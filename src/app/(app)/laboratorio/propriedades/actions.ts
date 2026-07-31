"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { propriedadeFields, talhaoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPropriedadeAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(propriedadeFields, formData);
  if (!data.name) return { error: "Informe o nome da propriedade." };
  if (!data.produtorId) return { error: "Selecione o produtor." };

  const propriedade = await prisma.propriedadeProdutor.create({
    data: { ...data, organizationId } as Prisma.PropriedadeProdutorUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/propriedades");
  redirect(`/laboratorio/propriedades/${propriedade.id}`);
}

export async function updatePropriedadeAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(propriedadeFields, formData);
  if (!data.name) return { error: "Informe o nome da propriedade." };
  if (!data.produtorId) return { error: "Selecione o produtor." };

  await prisma.propriedadeProdutor.updateMany({
    where: { id, organizationId },
    data: data as Prisma.PropriedadeProdutorUncheckedUpdateInput,
  });

  revalidatePath(`/laboratorio/propriedades/${id}`);
  revalidatePath("/laboratorio/propriedades");
  redirect(`/laboratorio/propriedades/${id}`);
}

export async function deletePropriedadeAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.propriedadeProdutor.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/propriedades");
}

export async function createTalhaoAction(propriedadeProdutorId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const propriedade = await prisma.propriedadeProdutor.findFirst({
    where: { id: propriedadeProdutorId, organizationId },
  });
  if (!propriedade) return;

  const data = buildRecordData(talhaoFields, formData);
  if (!data.code) return;

  await prisma.talhaoProdutor.create({
    data: { ...data, propriedadeProdutorId } as Prisma.TalhaoProdutorUncheckedCreateInput,
  });

  revalidatePath(`/laboratorio/propriedades/${propriedadeProdutorId}`);
}

export async function deleteTalhaoAction(propriedadeProdutorId: string, talhaoId: string) {
  const { organizationId } = await requireModule("laboratorio");
  const propriedade = await prisma.propriedadeProdutor.findFirst({
    where: { id: propriedadeProdutorId, organizationId },
  });
  if (!propriedade) return;

  await prisma.talhaoProdutor.deleteMany({
    where: { id: talhaoId, propriedadeProdutorId },
  });

  revalidatePath(`/laboratorio/propriedades/${propriedadeProdutorId}`);
}
