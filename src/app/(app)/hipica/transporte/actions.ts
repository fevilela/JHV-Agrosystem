"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/tenant";

type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function buildTransportData(formData: FormData) {
  const date = str(formData, "date");
  return {
    date: date ? new Date(date) : null,
    origin: str(formData, "origin"),
    destination: str(formData, "destination"),
    driver: str(formData, "driver"),
    vehicle: str(formData, "vehicle"),
    notes: str(formData, "notes"),
  };
}

export async function createTransportAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildTransportData(formData);
  if (!data.date) return { error: "Informe a data do transporte." };

  const animalIds = formData.getAll("animalIds") as string[];

  await prisma.transport.create({
    data: {
      date: data.date,
      origin: data.origin,
      destination: data.destination,
      driver: data.driver,
      vehicle: data.vehicle,
      notes: data.notes,
      organizationId,
      animals: {
        create: animalIds.map((animalId) => ({ animalId })),
      },
    },
  });

  revalidatePath("/hipica/transporte");
  redirect("/hipica/transporte");
}

export async function updateTransportAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildTransportData(formData);
  if (!data.date) return { error: "Informe a data do transporte." };

  const animalIds = formData.getAll("animalIds") as string[];

  const transport = await prisma.transport.findFirst({ where: { id, organizationId } });
  if (!transport) return { error: "Transporte não encontrado." };

  await prisma.$transaction([
    prisma.transportAnimal.deleteMany({ where: { transportId: id } }),
    prisma.transport.update({
      where: { id },
      data: {
        date: data.date,
        origin: data.origin,
        destination: data.destination,
        driver: data.driver,
        vehicle: data.vehicle,
        notes: data.notes,
        animals: {
          create: animalIds.map((animalId) => ({ animalId })),
        },
      },
    }),
  ]);

  revalidatePath("/hipica/transporte");
  redirect("/hipica/transporte");
}

export async function deleteTransportAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.transport.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/transporte");
}
