"use client";

import { useState } from "react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { api } from "@/lib/api";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const officeUrl = process.env.NEXT_PUBLIC_OFFICE_URL || "http://localhost:5173";

  const switchLocale = (next: "en" | "hi") => {
    router.replace(pathname, { locale: next });
  };

  const onLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — local session is cleared regardless
    }
    dispatch(logout());
    setMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/jobs", label: t("nav.jobs") },
    { href: "/auth/register/employer", label: t("nav.forEmployers") },
    { href: "/about", label: t("nav.about") },
  ];

  const dashboardHref = user?.accountType === "employer" ? "/employer" : "/seeker";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "transition hover:text-accent",
                pathname === link.href && "text-accent",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-line text-xs font-semibold">
            {(["en", "hi"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                className={clsx(
                  "px-2.5 py-1.5 transition",
                  locale === code ? "bg-ink text-white" : "bg-white text-ink-soft",
                )}
              >
                {code === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>

          {hydrated && user ? (
            <div className="hidden items-center gap-2 sm:flex">
              {user.accountType === "employer" && (
                <a
                  href={officeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm hidden lg:inline-flex"
                >
                  {t("nav.office")}
                </a>
              )}
              <Link href={dashboardHref} className="btn btn-primary btn-sm">
                {t("nav.dashboard")}
              </Link>
              <button type="button" onClick={() => void onLogout()} className="btn btn-quiet btn-sm">
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login" className="btn btn-quiet btn-sm">
                {t("nav.login")}
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                {t("nav.register")}
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="Menu"
            className="btn btn-outline btn-sm !px-3 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fade-in border-t border-line bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-ink-soft hover:bg-mist hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-line-soft pt-3">
            {hydrated && user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="btn btn-primary btn-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.dashboard")}
                </Link>
                {user.accountType === "employer" && (
                  <a
                    href={officeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    {t("nav.office")}
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => void onLogout()}
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.register")}
                </Link>
                <Link
                  href="/auth/login"
                  className="btn btn-outline btn-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
