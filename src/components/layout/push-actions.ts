"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";

export async function subscribeToPushAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const { organizationId, userId } = await requireOrg();
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { organizationId, userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      organizationId,
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function unsubscribeFromPushAction(endpoint: string) {
  await requireOrg();
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
