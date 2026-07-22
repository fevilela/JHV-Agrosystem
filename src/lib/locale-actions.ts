"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOCALE_COOKIE, SUPPORTED_LOCALES } from "@/i18n/request";

export async function setLocaleAction(locale: string) {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId) {
    await prisma.user.update({ where: { id: userId }, data: { locale } }).catch(() => {});
  }
}
