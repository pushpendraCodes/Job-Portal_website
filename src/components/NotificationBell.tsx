"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { api, type ApiSuccess } from "@/lib/api";
import { onUnreadCount, setUnreadCount } from "@/lib/unreadCount";
import { useAppSelector } from "@/store/hooks";
import { IconBell } from "@/components/ui/Icons";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const pathname = usePathname();
  const { user, accessToken, hydrated } = useAppSelector((s) => s.auth);
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const res = await api.get<ApiSuccess<{ count: number }>>("/notifications/unread-count");
      const count = res.data.data.count;
      setUnread(count);
      setUnreadCount(count);
    } catch {
      // keep last known count
    }
  }, []);

  useEffect(() => onUnreadCount(setUnread), []);

  useEffect(() => {
    if (!hydrated || !user || !accessToken) {
      setUnread(0);
      return;
    }
    void loadCount();
  }, [hydrated, user, accessToken, pathname, loadCount]);

  useEffect(() => {
    if (!hydrated || !user || !accessToken) return;

    const token = Cookies.get("accessToken") || accessToken;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const source = new EventSource(`${base}/notifications/stream?token=${encodeURIComponent(token)}`);

    const applyCount = (event: Event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as { unreadCount?: number };
        if (typeof payload.unreadCount === "number") setUnreadCount(payload.unreadCount);
      } catch {
        // ignore
      }
    };

    source.addEventListener("unread", applyCount);
    source.addEventListener("notification", applyCount);

    const poll = window.setInterval(() => {
      void loadCount();
    }, 30000);

    return () => {
      source.close();
      window.clearInterval(poll);
    };
  }, [hydrated, user, accessToken, loadCount]);

  if (!hydrated || !user) return null;

  const label = unread > 0 ? t("unreadCount", { count: unread }) : t("title");

  return (
    <Link href="/notifications" className="header-icon header-bell" aria-label={label}>
      <IconBell className="h-4 w-4" />
      {unread > 0 && <span className="header-bell-dot">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
