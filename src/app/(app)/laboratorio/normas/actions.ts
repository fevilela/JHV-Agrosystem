"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { normaReferenciaFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createNormaReferenciaAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(normaReferenciaFields, formData);
  if (!data.nome) return { error: "Informe o nome da norma." };

  await prisma.normaReferencia.create({
    data: { ...data, organizationId } as Prisma.NormaReferenciaUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/normas");
  redirect("/laboratorio/normas");
}

export async function updateNormaReferenciaAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(normaReferenciaFields, formData);
  if (!data.nome) return { error: "Informe o nome da norma." };

  await prisma.normaReferencia.updateMany({
    where: { id, organizationId },
    data: data as Prisma.NormaReferenciaUncheckedUpdateInput,
  });

  revalidatePath("/laboratorio/normas");
  redirect("/laboratorio/normas");
}

export async function deleteNormaReferenciaAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.normaReferencia.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/normas");
}
