"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";

export async function markNotificationReadAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.notification.updateMany({
    where: { id, organizationId },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const { organizationId } = await requireOrg();
  await prisma.notification.updateMany({
    where: { organizationId, read: false },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}
