import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ApiSuccess } from "@/lib/api";

async function fetchAbout() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  try {
    const res = await fetch(`${base}/cms/pages/about`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiSuccess<{
      titleEn: string;
      titleHi: string;
      bodyEn: string;
      bodyHi: string;
    }>;
    return json.data;
  } catch {
    return null;
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const page = await fetchAbout();

  const title = page ? (locale === "hi" ? page.titleHi : page.titleEn) : t("about.title");
  const body = page ? (locale === "hi" ? page.bodyHi : page.bodyEn) : t("about.intro");

  const pillars = ["pillar1", "pillar2", "pillar3"] as const;

  return (
    <>
      <section className="page-hero py-16 sm:py-20">
        <div className="container-x max-w-3xl">
          <p className="eyebrow">{t("nav.about")}</p>
          <h1 className="mt-3 font-display text-[1.75rem] leading-[1.15] tracking-[-0.022em] text-ink sm:text-[2.125rem]">{title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">{body}</p>
        </div>
      </section>

      <section className="container-x section">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((key, index) => (
            <div key={key} className="card p-6">
              <span className="font-display text-4xl text-accent/25">0{index + 1}</span>
              <h2 className="mt-3 font-display text-xl text-ink">{t(`about.${key}Title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t(`about.${key}Body`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[12px] border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-2xl text-ink">{t("about.ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-soft">{t("about.ctaSub")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth/register/seeker" className="btn btn-primary">
              {t("auth.registerSeeker")}
            </Link>
            <Link href="/auth/register/employer" className="btn btn-outline">
              {t("auth.registerEmployer")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
