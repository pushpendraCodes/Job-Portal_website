import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="mesh-bg flex min-h-[70vh] items-center py-16">
      <div className="container-x text-center">
        <p className="font-display text-7xl text-accent/25">404</p>
        <h1 className="mt-3 font-display text-3xl text-ink">{t("notFound.title")}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{t("notFound.body")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            {t("notFound.home")}
          </Link>
          <Link href="/jobs" className="btn btn-outline">
            {t("nav.jobs")}
          </Link>
        </div>
      </div>
    </div>
  );
}
