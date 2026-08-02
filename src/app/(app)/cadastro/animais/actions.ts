"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { requireOrg } from "@/lib/tenant";
import { AnimalSexo, AnimalStatus } from "@prisma/client";

type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function buildAnimalData(formData: FormData) {
  const peso = str(formData, "peso");
  const altura = str(formData, "altura");
  const dataNascimento = str(formData, "dataNascimento");
  const sexo = str(formData, "sexo");
  const status = str(formData, "status");

  return {
    name: str(formData, "name") ?? "",
    registro: str(formData, "registro"),
    especie: str(formData, "especie") ?? "Equino",
    raca: str(formData, "raca"),
    sexo: sexo ? (sexo as AnimalSexo) : null,
    pelagem: str(formData, "pelagem"),
    dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
    microchip: str(formData, "microchip"),
    peso: peso ? Number(peso) : null,
    altura: altura ? Number(altura) : null,
    status: status ? (status as AnimalStatus) : AnimalStatus.ATIVO,
    notes: str(formData, "notes"),
    ownerId: str(formData, "ownerId"),
    paiId: str(formData, "paiId"),
    maeId: str(formData, "maeId"),
  };
}

async function requireOwnedAnimal(animalId: string, organizationId: string) {
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, organizationId },
    select: { id: true },
  });
  if (!animal) {
    const t = await getTranslations("cadastro.animais.errors");
    throw new Error(t("notFound"));
  }
}

export async function createAnimalAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const data = buildAnimalData(formData);
  const t = await getTranslations("cadastro.animais.errors");
  if (!data.name) return { error: t("nameRequired") };

  let animal;
  try {
    animal = await prisma.animal.create({ data: { ...data, organizationId } });
  } catch {
    return { error: t("saveConflict") };
  }

  revalidatePath("/cadastro/animais");
  redirect(`/cadastro/animais/${animal.id}`);
}

export async function updateAnimalAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const data = buildAnimalData(formData);
  const t = await getTranslations("cadastro.animais.errors");
  if (!data.name) return { error: t("nameRequired") };
  if (data.paiId === id || data.maeId === id) {
    return { error: t("selfParent") };
  }

  try {
    await prisma.animal.updateMany({ where: { id, organizationId }, data });
  } catch {
    return { error: t("saveConflict") };
  }

  revalidatePath("/cadastro/animais");
  revalidatePath(`/cadastro/animais/${id}`);
  redirect(`/cadastro/animais/${id}`);
}

export async function deleteAnimalAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.animal.deleteMany({ where: { id, organizationId } });
  revalidatePath("/cadastro/animais");
  redirect("/cadastro/animais");
}

export async function uploadAnimalPhotoAction(
  animalId: string,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  await requireOwnedAnimal(animalId, organizationId);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const caption = str(formData, "caption");
  const { url } = await saveUploadedFile(file, `animals/${animalId}/photos`);

  await prisma.animalPhoto.create({
    data: { animalId, url, caption },
  });

  revalidatePath(`/cadastro/animais/${animalId}`);
}

export async function deleteAnimalPhotoAction(
  animalId: string,
  photoId: string
) {
  const { organizationId } = await requireOrg();
  await requireOwnedAnimal(animalId, organizationId);

  const photo = await prisma.animalPhoto.delete({ where: { id: photoId } });
  await deleteUploadedFile(photo.url);

  revalidatePath(`/cadastro/animais/${animalId}`);
}

export async function uploadAnimalDocumentAction(
  animalId: string,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  await requireOwnedAnimal(animalId, organizationId);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const type = str(formData, "type");
  const { url, name } = await saveUploadedFile(
    file,
    `animals/${animalId}/documents`
  );

  await prisma.animalDocument.create({
    data: { animalId, url, name, type },
  });

  revalidatePath(`/cadastro/animais/${animalId}`);
}

export async function deleteAnimalDocumentAction(
  animalId: string,
  documentId: string
) {
  const { organizationId } = await requireOrg();
  await requireOwnedAnimal(animalId, organizationId);

  const document = await prisma.animalDocument.delete({ where: { id: documentId } });
  await deleteUploadedFile(document.url);

  revalidatePath(`/cadastro/animais/${animalId}`);
}
