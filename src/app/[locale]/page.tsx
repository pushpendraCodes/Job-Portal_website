import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobListItem } from "@/components/JobListItem";
import { HeroSearch } from "@/components/HeroSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryMark } from "@/components/ui/Icons";
import type { ApiSuccess } from "@/lib/api";
import type { CmsBanner, Job, JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";

const FALLBACK_HERO = "/hero-textile.png";

function pickHeroBanner(banners: CmsBanner[] | null) {
  const now = Date.now();
  const live = (banners ?? []).filter((banner) => {
    if (!banner.imageUrl) return false;
    if (banner.startsAt && new Date(banner.startsAt).getTime() > now) return false;
    if (banner.endsAt && new Date(banner.endsAt).getTime() < now) return false;
    return true;
  });
  return live.find((banner) => banner.placement === "home_hero") || live[0] || null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function fetchJson<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiSuccess<T>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [jobs, categories, banners] = await Promise.all([
    fetchJson<Job[]>("/jobs?limit=6&sortBy=publishedAt&sortOrder=desc"),
    fetchJson<JobCategory[]>("/categories", 300),
    fetchJson<CmsBanner[]>("/cms/banners?placement=home_hero", 10),
  ]);

  const heroBanner = pickHeroBanner(banners);
  const heroImage = heroBanner?.imageUrl || FALLBACK_HERO;
  const heroAlt =
    (locale === "hi" ? heroBanner?.titleHi || heroBanner?.titleEn : heroBanner?.titleEn || heroBanner?.titleHi) ||
    t("home.headline");
  const latestJobs = jobs ?? [];
  const topCategories = (categories ?? []).slice(0, 8);
  const steps = [
    { key: "how1", href: "/auth/register/seeker", cta: t("home.how1Cta") },
    { key: "how2", href: "/jobs", cta: t("home.how2Cta") },
    { key: "how3", href: "/jobs", cta: t("home.how3Cta") },
  ] as const;
  const proof = [
    { title: t("home.trust1"), hint: t("home.trust1Hint") },
    { title: t("home.trust2"), hint: t("home.trust2Hint") },
    { title: t("home.trust3"), hint: t("home.trust3Hint") },
    { title: t("home.trust4"), hint: t("home.trust4Hint") },
  ];

  return (
    <>
      <section className="hero-soft">
        <div className="container-x grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-6 lg:py-8">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-semibold tracking-[0.12em] text-accent sm:text-base">
              {t("home.kicker")}
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-[3.85rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[4.6rem] lg:text-[5.15rem]">
              {t("home.headline")}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              {t("home.sub")}
            </p>
            <div className="mt-7">
              <HeroSearch categories={categories ?? []} />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            {heroBanner?.linkUrl ? (
              heroBanner.linkUrl.startsWith("http") ? (
                <a href={heroBanner.linkUrl} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt={heroAlt} className="hero-photo" />
                </a>
              ) : (
                <Link href={heroBanner.linkUrl}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt={heroAlt} className="hero-photo" />
                </Link>
              )
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={heroAlt} className="hero-photo" />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container-x py-8">
          <div className="trust-grid">
            {proof.map((item) => (
              <div key={item.title} className="trust-item">
                <strong>{item.title}</strong>
                <span>{item.hint}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x section">
        <div className="mb-8 max-w-xl">
          <p className="eyebrow">{t("home.howEyebrow")}</p>
          <h2 className="mt-2 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            {t("home.howTitle")}
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.key} className="card p-6">
              <span className="font-display text-5xl font-semibold leading-none tracking-tight text-accent/25">
                0{index + 1}
              </span>
              <h3 className="mt-3 font-display text-lg text-ink">{t(`home.${step.key}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`home.${step.key}Body`)}</p>
              <Link href={step.href} className="funnel-cta inline-flex">
                {step.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {topCategories.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="container-x section">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{t("home.categoriesEyebrow")}</p>
                <h2 className="mt-2 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">
                  {t("home.categoriesTitle")}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">{t("home.categoriesSub")}</p>
              </div>
              <Link href="/categories" className="btn btn-outline btn-sm">
                {t("home.viewAllCategories")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {topCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/jobs?categoryId=${category._id}`}
                  className="card card-hover flex items-center gap-3 p-4"
                >
                  <CategoryMark label={categoryName(category, locale)} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {categoryName(category, locale)}
                    </span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <span className="mt-0.5 block text-xs text-ink-mute">
                        {t("home.subcategoryCount", { count: category.subcategories.length })}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-x section">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t("home.jobsEyebrow")}</p>
            <h2 className="mt-2 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("home.sectionJobsTitle")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{t("home.sectionJobsSub")}</p>
          </div>
          <Link href="/jobs" className="btn btn-outline btn-sm">
            {t("home.viewAll")}
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <EmptyState
            title={t("jobs.noJobs")}
            description={t("jobs.noJobsHint")}
            action={
              <Link href="/jobs" className="btn btn-primary btn-sm">
                {t("home.ctaJobs")}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {latestJobs.map((job) => (
              <JobListItem key={job._id} job={job} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section className="container-x pb-16">
        <div className="rounded-[12px] border border-line bg-surface px-6 py-8 sm:px-10">
          <p className="eyebrow">{t("home.employerEyebrow")}</p>
          <h2 className="mt-2 max-w-xl font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            {t("home.employerTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">{t("home.employerSub")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/auth/register/employer" className="btn btn-primary">
              {t("home.employerCta")}
            </Link>
            <Link href="/about" className="btn btn-outline">
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
