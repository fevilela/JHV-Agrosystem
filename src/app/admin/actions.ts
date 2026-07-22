"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RETROFITTED_MODULES, navGroups } from "@/lib/nav";
import { seedChartOfAccounts } from "@/lib/chart-of-accounts";

type FormState = { error?: string } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// Só módulos já isolados por organização podem ser habilitados pra uma organização
// (senão o próprio admin poderia vazar dado entre clientes ligando um módulo ainda não retrofitado).
function readAllowedModules(formData: FormData) {
  return RETROFITTED_MODULES.filter((key) => formData.get(`module_${key}`) === "on");
}

// Já pra um usuário dentro de uma organização, qualquer módulo que a própria organização já tenha
// pode ser liberado — o formulário só mostra caixinha pros módulos que a organização já tem, e
// requireOrg() sempre intersecta com organization.allowedModules na leitura, então não tem como
// esse formulário conceder a um usuário mais acesso do que a organização já permite.
function readUserAllowedModules(formData: FormData) {
  return navGroups.map((g) => g.key).filter((key) => formData.get(`module_${key}`) === "on");
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
      mpAccessToken: str(formData, "mpAccessToken"),
      resendApiKey: str(formData, "resendApiKey"),
      resendFromEmail: str(formData, "resendFromEmail"),
      allowedModules: readAllowedModules(formData),
      active: true,
    },
  });

  await seedChartOfAccounts(prisma, org.id);

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

  const novoMpToken = str(formData, "mpAccessToken");
  const novaResendKey = str(formData, "resendApiKey");
  const limparMpToken = formData.get("clearMpToken") === "on";
  const limparResendKey = formData.get("clearResendKey") === "on";

  // O formulário só mostra caixinha pros módulos já isolados por organização
  // (RETROFITTED_MODULES). Qualquer módulo que a organização já tinha fora
  // dessa lista (ex: liberado manualmente antes de existir a caixinha) precisa
  // ser preservado — senão salvar o formulário apaga silenciosamente módulos
  // que ele nem consegue exibir.
  const current = await prisma.organization.findUnique({
    where: { id },
    select: { allowedModules: true },
  });
  const modulosForaDoFormulario = (current?.allowedModules ?? []).filter(
    (m) => !RETROFITTED_MODULES.includes(m)
  );
  const allowedModules = [...modulosForaDoFormulario, ...readAllowedModules(formData)];

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
      // campo em branco mantém o valor já salvo (não exibimos segredos de volta no formulário);
      // a caixa "remover" força limpar mesmo com o campo em branco
      ...(limparMpToken ? { mpAccessToken: null } : novoMpToken ? { mpAccessToken: novoMpToken } : {}),
      ...(limparResendKey ? { resendApiKey: null } : novaResendKey ? { resendApiKey: novaResendKey } : {}),
      resendFromEmail: str(formData, "resendFromEmail"),
      allowedModules,
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
      allowedModules: readUserAllowedModules(formData),
      organizationId,
    },
  });

  revalidatePath(`/admin/${organizationId}`);
  redirect(`/admin/${organizationId}`);
}

export async function updateOrgUserAction(
  organizationId: string,
  userId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") || "FUNCIONARIO";

  if (!name) return { error: "Informe o nome." };
  if (!email) return { error: "Informe o e-mail." };
  if (password && password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "Já existe outra conta com esse e-mail." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      role: role as "ADMIN" | "GERENTE" | "FUNCIONARIO",
      allowedModules: readUserAllowedModules(formData),
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath(`/admin/${organizationId}`);
  redirect(`/admin/${organizationId}`);
}

export async function deleteOrgUserAction(organizationId: string, userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath(`/admin/${organizationId}`);
}
