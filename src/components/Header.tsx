"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { api } from "@/lib/api";

const LOCALES = ["en", "hi"] as const;

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);

  const officeUrl = process.env.NEXT_PUBLIC_OFFICE_URL || "http://localhost:5173";
  const isHome = pathname === "/";
  /** Only the home hero is dark enough to carry a transparent bar. */
  const clear = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlays on navigation and on Escape.
  useEffect(() => {
    setDrawerOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrawerOpen(false);
      setAccountOpen(false);
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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
    setDrawerOpen(false);
    setAccountOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/jobs", label: t("nav.jobs"), icon: "🔎" },
    { href: "/categories", label: t("nav.categories"), icon: "🧵" },
    { href: "/auth/register/employer", label: t("nav.forEmployers"), icon: "🏭" },
    { href: "/about", label: t("nav.about"), icon: "ℹ️" },
  ];

  const dashboardHref = user?.accountType === "employer" ? "/employer" : "/seeker";
  const initial = (user?.email || user?.mobile || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <header className={clsx("site-header", clear ? "site-header-clear" : "site-header-solid")}>
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="brand flex items-center gap-2.5">
            <span className="brand-mark font-display text-lg">L</span>
            <span
              className={clsx(
                "font-display text-xl tracking-tight transition-colors sm:text-2xl",
                clear ? "text-white" : "text-ink",
              )}
            >
              {t("brand")}
            </span>
          </Link>

          <nav
            className={clsx(
              "hidden items-center gap-7 text-sm font-semibold transition-colors md:flex",
              clear ? "text-white/85" : "text-ink-soft",
            )}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "nav-link",
                  pathname === link.href
                    ? clsx("nav-link-active", clear ? "text-white" : "text-accent")
                    : clear
                      ? "hover:text-white"
                      : "hover:text-accent",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className={clsx("lang-switch", clear && "lang-switch-clear")}>
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
                    locale === code
                      ? clear
                        ? "text-ink"
                        : "text-white"
                      : clear
                        ? "text-white/75"
                        : "text-ink-soft",
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
                  className={clsx(
                    "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold transition",
                    clear
                      ? "border-white/30 bg-white/12 text-white hover:bg-white/20"
                      : "border-line bg-white text-ink hover:border-accent",
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-white">
                    {initial}
                  </span>
                  <span className="hidden lg:inline">{t("nav.account")}</span>
                  <span className={clsx("text-xs transition", accountOpen && "rotate-180")}>▾</span>
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="menu-pop absolute right-0 mt-2 w-56 overflow-hidden rounded-[14px] border border-line bg-white p-1.5 shadow-lg"
                  >
                    <p className="truncate px-3 pb-2 pt-1.5 text-xs text-ink-mute">
                      {user.email || user.mobile}
                    </p>
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                    >
                      <span>📊</span>
                      {t("nav.dashboard")}
                    </Link>
                    {user.accountType === "employer" && (
                      <>
                        <Link
                          href="/employer/talent"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <span>🔎</span>
                          {t("talent.findTalent")}
                        </Link>
                        <Link
                          href="/employer/jobs/new"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <span>➕</span>
                          {t("nav.postJob")}
                        </Link>
                        <a
                          href={officeUrl}
                          target="_blank"
                          rel="noreferrer"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                        >
                          <span>🏢</span>
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
                      <span>↩</span>
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/auth/login"
                  className={clsx(
                    "btn btn-sm",
                    clear ? "btn-ghost" : "btn-quiet",
                  )}
                >
                  {t("nav.login")}
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  {t("nav.register")}
                </Link>
              </div>
            )}

            <button
              type="button"
              aria-label={t("nav.menu")}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-full border transition md:hidden",
                clear
                  ? "border-white/30 bg-white/12 text-white"
                  : "border-line bg-white text-ink",
              )}
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-4 rounded bg-current" />
                <span className="block h-[2px] w-4 rounded bg-current" />
                <span className="block h-[2px] w-3 rounded bg-current" />
              </span>
            </button>
          </div>
        </div>

        {/* Reading progress — a quiet hint of how far down the page you are. */}
        <div
          className={clsx("h-[2px] origin-left bg-accent transition-opacity", scrolled ? "opacity-100" : "opacity-0")}
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t("nav.close")}
            className="fade-in absolute inset-0 bg-ink/45 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="drawer-panel absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="flex items-center gap-2.5">
                <span className="brand-mark font-display text-base">L</span>
                <span className="font-display text-xl text-ink">{t("brand")}</span>
              </span>
              <button
                type="button"
                aria-label={t("nav.close")}
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  style={{ animationDelay: `${index * 55}ms` }}
                  className={clsx(
                    "drawer-item flex items-center gap-3 rounded-[12px] px-3 py-3.5 text-base font-semibold",
                    pathname === link.href
                      ? "bg-accent-tint text-accent-deep"
                      : "text-ink hover:bg-mist",
                  )}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 border-t border-line px-4 py-4">
              {hydrated && user ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="btn btn-primary"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t("nav.dashboard")}
                  </Link>
                  {user.accountType === "employer" && (
                    <a href={officeUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                      {t("nav.office")}
                    </a>
                  )}
                  <button type="button" className="btn btn-quiet" onClick={() => void onLogout()}>
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="btn btn-primary"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/auth/login"
                    className="btn btn-outline"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* The home hero slides under the transparent bar; every other page needs the space back. */}
      {!isHome && <div className="h-16" aria-hidden="true" />}
    </>
  );
}
