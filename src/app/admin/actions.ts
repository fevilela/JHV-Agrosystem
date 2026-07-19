"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RETROFITTED_MODULES } from "@/lib/nav";

type FormState = { error?: string } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function readAllowedModules(formData: FormData) {
  return RETROFITTED_MODULES.filter((key) => formData.get(`module_${key}`) === "on");
}

export async function createOrganizationAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = str(formData, "name");
  if (!name) return { error: "Informe o nome/razão social." };

  const org = await prisma.organization.create({
    data: {
      name,
      cpfCnpj: str(formData, "cpfCnpj"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      zipCode: str(formData, "zipCode"),
      streetNumber: str(formData, "streetNumber"),
      neighborhood: str(formData, "neighborhood"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      allowedModules: readAllowedModules(formData),
      active: true,
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/${org.id}`);
}

export async function updateOrganizationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = str(formData, "name");
  if (!name) return { error: "Informe o nome/razão social." };

  await prisma.organization.update({
    where: { id },
    data: {
      name,
      cpfCnpj: str(formData, "cpfCnpj"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      zipCode: str(formData, "zipCode"),
      streetNumber: str(formData, "streetNumber"),
      neighborhood: str(formData, "neighborhood"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      allowedModules: readAllowedModules(formData),
      active: formData.get("active") === "on",
    },
  });

  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/${id}`);
}

export async function createOrgUserAction(
  organizationId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") || "FUNCIONARIO";

  if (!name) return { error: "Informe o nome." };
  if (!email) return { error: "Informe o e-mail." };
  if (!password || password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as "ADMIN" | "GERENTE" | "FUNCIONARIO",
      organizationId,
    },
  });

  revalidatePath(`/admin/${organizationId}`);
  redirect(`/admin/${organizationId}`);
}

export async function deleteOrgUserAction(organizationId: string, userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath(`/admin/${organizationId}`);
}
