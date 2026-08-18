import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-2xl text-ink">{t("brand")}</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{t("tagline")}</p>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold text-ink">{t("footer.explore")}</div>
          <div className="flex flex-col gap-2.5 text-ink-soft">
            <Link href="/jobs" className="hover:text-accent">
              {t("nav.jobs")}
            </Link>
            <Link href="/about" className="hover:text-accent">
              {t("nav.about")}
            </Link>
          </div>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold text-ink">{t("footer.jobSeekers")}</div>
          <div className="flex flex-col gap-2.5 text-ink-soft">
            <Link href="/auth/register/seeker" className="hover:text-accent">
              {t("auth.registerSeeker")}
            </Link>
            <Link href="/auth/login?type=job_seeker" className="hover:text-accent">
              {t("nav.login")}
            </Link>
          </div>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold text-ink">{t("footer.employers")}</div>
          <div className="flex flex-col gap-2.5 text-ink-soft">
            <Link href="/auth/register/employer" className="hover:text-accent">
              {t("auth.registerEmployer")}
            </Link>
            <Link href="/auth/login?type=employer" className="hover:text-accent">
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {t("brand")} · {t("footer.rights")}
      </div>
    </footer>
  );
}
