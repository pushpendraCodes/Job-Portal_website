import { setRequestLocale } from "next-intl/server";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotificationsClient />;
}
