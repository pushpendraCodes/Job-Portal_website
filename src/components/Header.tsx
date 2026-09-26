"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { api } from "@/lib/api";
import { nameInitials } from "@/lib/types";
import { TabIcon } from "@/components/TabIcons";
import {
  IconDashboard,
  IconLogout,
  IconOffice,
  IconPlus,
  IconSearch,
  IconTalent,
  IconBell,
} from "@/components/ui/Icons";
import { NotificationBell } from "@/components/NotificationBell";

const LOCALES = ["en", "hi"] as const;

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);

  const officeUrl = process.env.NEXT_PUBLIC_OFFICE_URL || "http://localhost:5173";

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const switchLocale = (next: (typeof LOCALES)[number]) => {
    router.replace(pathname, { locale: next });
  };

  const onLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — local session is cleared regardless
    }
    dispatch(logout());
    setAccountOpen(false);
    router.push("/");
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: "home" as const },
    { href: "/jobs", label: t("nav.jobs"), icon: "jobs" as const },
    { href: "/categories", label: t("nav.categories"), icon: "trades" as const },
    { href: "/auth/register/seeker", label: t("nav.forWorkers"), short: t("nav.forWorkersShort"), icon: "workers" as const },
    { href: "/auth/register/employer", label: t("nav.forEmployers"), short: t("nav.forEmployersShort"), icon: "hire" as const },
  ];

  const dashboardHref = user?.accountType === "employer" ? "/employer" : "/seeker";
  const displayName = user?.name?.trim() || "";
  const firstName = displayName.split(/\s+/)[0] || t("nav.account");
  const initial =
    nameInitials(displayName) ||
    (user?.email || user?.mobile || "?").trim().slice(0, 2).toUpperCase();

  return (
    <>
      <header className="site-header site-header-solid">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="brand flex min-w-0 items-center gap-2.5">
            <span className="brand-mark font-display text-lg">L</span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-none tracking-tight text-ink">
                {t("brand")}
              </span>
              <span className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-mute sm:block">
                {t("nav.brandHint")}
              </span>
            </span>
          </Link>

          <nav className="nav-pill mx-auto" aria-label={t("nav.menu")}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "nav-pill-link",
                  isActive(link.href) && "nav-pill-link-active",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form className="header-search" onSubmit={onSearch}>
              <IconSearch className="h-4 w-4 text-ink-mute" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("nav.searchJobs")}
                aria-label={t("nav.search")}
              />
            </form>
            <Link href="/jobs" aria-label={t("nav.search")} className="header-icon header-search-link">
              <IconSearch className="h-4 w-4" />
            </Link>
            <NotificationBell />
            <div className="lang-switch hidden sm:inline-flex">
              <span
                className="lang-thumb"
                style={{ transform: `translateX(${locale === "hi" ? "100%" : "0%"})` }}
                aria-hidden="true"
              />
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  aria-pressed={locale === code}
                  className={clsx(
                    "lang-option",
                    locale === code ? "text-white" : "text-ink-soft",
                  )}
                >
                  {code === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>

            {hydrated && user ? (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="header-icon header-account text-sm font-semibold"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-xs text-white">
                    {initial}
                  </span>
                  <span className="hidden max-w-[8rem] truncate lg:inline">{firstName}</span>
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="menu-pop absolute right-0 mt-2 w-56 overflow-hidden rounded-[14px] border border-line bg-surface p-1.5 shadow-lg"
                  >
                    <div className="px-3 pb-2 pt-1.5">
                      {displayName && (
                        <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                      )}
                      <p className="truncate text-xs text-ink-mute">{user.email || user.mobile}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                    >
                      <IconDashboard />
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      href="/notifications"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                    >
                      <IconBell />
                      {t("nav.notifications")}
                    </Link>
                    {user.accountType === "employer" && (
                      <>
                        <Link
                          href="/employer/talent"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <IconTalent />
                          {t("talent.findTalent")}
                        </Link>
                        <Link
                          href="/employer/jobs/new"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <IconPlus />
                          {t("nav.postJob")}
                        </Link>
                        <a
                          href={officeUrl}
                          target="_blank"
                          rel="noreferrer"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <IconOffice />
                          {t("nav.office")}
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void onLogout()}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-[10px] border-t border-line-soft px-3 py-2.5 text-sm font-medium text-danger hover:bg-mist"
                    >
                      <IconLogout />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/auth/login" className="btn btn-sm header-login">
                  {t("nav.login")}
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  {t("nav.register")}
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>

      <div className="h-[4.5rem]" aria-hidden="true" />

      <nav className="tabbar" aria-label={t("nav.menu")}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} data-active={isActive(link.href)}>
            <TabIcon name={link.icon} />
            {link.short ?? link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
