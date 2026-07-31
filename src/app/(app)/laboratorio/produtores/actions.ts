"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { produtorFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createProdutorAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(produtorFields, formData);
  if (!data.name) return { error: "Informe o nome/razão social." };

  await prisma.produtor.create({
    data: { ...data, organizationId } as Prisma.ProdutorUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/produtores");
  redirect("/laboratorio/produtores");
}

export async function updateProdutorAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(produtorFields, formData);
  if (!data.name) return { error: "Informe o nome/razão social." };

  await prisma.produtor.updateMany({
    where: { id, organizationId },
    data: data as Prisma.ProdutorUncheckedUpdateInput,
  });

  revalidatePath("/laboratorio/produtores");
  redirect("/laboratorio/produtores");
}

export async function deleteProdutorAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.produtor.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/produtores");
}
