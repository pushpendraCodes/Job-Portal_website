"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconBell } from "@/components/ui/Icons";
import {
  notificationBody,
  notificationHref,
  notificationTitle,
  type PortalNotification,
} from "@/lib/notifications";
import { setUnreadCount } from "@/lib/unreadCount";

function timeAgo(value: string, locale: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (locale === "hi") {
    if (days <= 0) return "आज";
    if (days === 1) return "कल";
    if (days < 30) return `${days} दिन पहले`;
    return `${Math.floor(days / 30)} माह पहले`;
  }
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function NotificationsClient() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [items, setItems] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get<ApiSuccess<PortalNotification[]>>("/notifications", {
        params: { limit: 50, sortBy: "createdAt", sortOrder: "desc" },
      });
      setItems(res.data.data);
      setUnreadCount(res.data.data.filter((item) => !item.isRead).length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/auth/login?next=/notifications");
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  const markRead = async (item: PortalNotification) => {
    if (item.isRead) return;
    const remaining = Math.max(0, items.filter((row) => !row.isRead).length - 1);
    setItems((prev) => prev.map((row) => (row._id === item._id ? { ...row, isRead: true } : row)));
    setUnreadCount(remaining);
    try {
      const res = await api.patch<ApiSuccess<{ unreadCount?: number }>>(
        `/notifications/${item._id}/read`,
      );
      if (typeof res.data.data.unreadCount === "number") {
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch {
      // local count already dropped
    }
  };

  const markAll = async () => {
    try {
      await api.post<ApiSuccess<{ unreadCount?: number }>>("/notifications/read-all");
      setItems((prev) => prev.map((row) => ({ ...row, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const unread = items.filter((item) => !item.isRead).length;

  if (!hydrated || !user) {
    return (
      <div className="container-x py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            {user.accountType === "employer" ? t("employerHint") : t("seekerHint")}
          </p>
        </div>
        {unread > 0 && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void markAll()}>
            {t("markAll")}
          </button>
        )}
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-[12px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconBell className="h-5 w-5" />}
          title={t("empty")}
          description={t("emptyHint")}
          action={
            <Link href={user.accountType === "employer" ? "/employer" : "/jobs"} className="btn btn-primary btn-sm">
              {user.accountType === "employer" ? t("goDashboard") : t("goJobs")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const href = notificationHref(item);
            return (
              <Link
                key={item._id}
                href={href}
                onClick={(event) => {
                  if (!item.isRead) {
                    event.preventDefault();
                    void markRead(item).then(() => router.push(href));
                  }
                }}
                className={`card card-hover block p-5 ${item.isRead ? "" : "notify-unread"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{notificationTitle(item, locale)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {notificationBody(item, locale)}
                    </p>
                    <p className="mt-2 text-xs text-ink-mute">{timeAgo(item.createdAt, locale)}</p>
                  </div>
                  {!item.isRead && <span className="notify-dot" aria-hidden="true" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
