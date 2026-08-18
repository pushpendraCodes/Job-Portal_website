import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobListItem } from "@/components/JobListItem";
import { HeroSearch } from "@/components/HeroSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { HOME_MEDIA } from "@/lib/homeMedia";
import type { ApiSuccess } from "@/lib/api";
import type { Job, JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";

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

const FLOOR_COPY = {
  knitting: { title: "industryKnitting", hint: "industryKnittingHint" },
  dyeing: { title: "industryDyeing", hint: "industryDyeingHint" },
  cutting: { title: "industryCutting", hint: "industryCuttingHint" },
  packing: { title: "industryPacking", hint: "industryPackingHint" },
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [jobs, categories, heroBanners] = await Promise.all([
    fetchJson<Job[]>("/jobs?limit=6&sortBy=publishedAt&sortOrder=desc"),
    fetchJson<JobCategory[]>("/categories", 300),
    fetchJson<Array<{ imageUrl: string; titleEn?: string }>>("/cms/banners?placement=home_hero", 120),
  ]);

  const latestJobs = jobs ?? [];
  const topCategories = (categories ?? []).slice(0, 8);
  const heroImage = heroBanners?.[0]?.imageUrl || HOME_MEDIA.hero;

  return (
    <>
      {/* Hero — full-bleed hosiery / textile mill visual */}
      <section className="relative min-h-[72vh] overflow-hidden text-white">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07151f] via-[#0c1f2e]/92 to-[#0c1f2e]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,21,31,0.55))]" />

        <div className="container-x relative flex min-h-[72vh] flex-col justify-center py-16 sm:py-20">
          <p className="fade-up text-xs font-bold uppercase tracking-[0.16em] text-accent-soft">
            LoomHire
          </p>

          <h1 className="fade-up-delay mt-4 max-w-3xl font-display text-3xl leading-tight sm:text-5xl md:text-6xl">
            {t("home.headline")}
          </h1>
          <p className="fade-up-delay-2 mt-4 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            {t("home.sub")}
          </p>

          <div className="fade-up-delay-2 mt-8 max-w-3xl">
            <HeroSearch />
          </div>

          <div className="fade-up-delay-2 mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn btn-ghost">
              {t("home.ctaJobs")}
            </Link>
            <Link href="/auth/register/employer" className="btn btn-primary">
              {t("home.ctaEmployer")}
            </Link>
          </div>

          <dl className="fade-up-delay-2 mt-12 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4">
            {[
              { value: "12k+", key: "statSeekers" },
              { value: "800+", key: "statEmployers" },
              { value: "40+", key: "statCities" },
              { value: "100%", key: "statFree" },
            ].map((stat) => (
              <div key={stat.key}>
                <dt className="font-display text-2xl text-white sm:text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-xs text-white/65">{t(`home.${stat.key}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Industry floors banner */}
      <section className="bg-[#0c1f2e] text-white">
        <div className="container-x py-12 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-soft">
              {t("home.industryEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("home.industryTitle")}</h2>
            <p className="mt-2 text-white/70">{t("home.industrySub")}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_MEDIA.floors.map((floor, index) => {
              const copy = FLOOR_COPY[floor.key];
              return (
                <Link
                  key={floor.key}
                  href={`/jobs?q=${encodeURIComponent(floor.query)}`}
                  className="group relative block min-h-[220px] overflow-hidden rounded-[16px]"
                >
                  <Image
                    src={floor.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07151f] via-[#07151f]/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl text-white">{t(`home.${copy.title}`)}</h3>
                    <p className="mt-1 text-sm text-white/70">{t(`home.${copy.hint}`)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="container-x section">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">{t("home.categoriesEyebrow")}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{t("home.categoriesTitle")}</h2>
              <p className="mt-2 text-ink-soft">{t("home.categoriesSub")}</p>
            </div>
            <Link href="/categories" className="btn btn-outline btn-sm">
              {t("home.viewAllCategories")} →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topCategories.map((category, index) => (
              <Link
                key={category._id}
                href={`/jobs?categoryId=${category._id}`}
                className="group relative overflow-hidden rounded-[16px] border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-28 overflow-hidden">
                  <Image
                    src={
                      category.iconUrl ||
                      HOME_MEDIA.categoryImages[index % HOME_MEDIA.categoryImages.length]
                    }
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0c1f2e]/25" />
                </div>
                <div className="px-4 py-4">
                  <span className="font-semibold text-ink">{categoryName(category, locale)}</span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <p className="mt-1 text-xs text-ink-soft">
                      {t("home.subcategoryCount", { count: category.subcategories.length })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest jobs */}
      <section className="mesh-bg">
        <div className="container-x section">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.jobsEyebrow")}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                {t("home.sectionJobsTitle")}
              </h2>
              <p className="mt-2 text-ink-soft">{t("home.sectionJobsSub")}</p>
            </div>
            <Link href="/jobs" className="btn btn-outline btn-sm">
              {t("home.viewAll")} →
            </Link>
          </div>

          {latestJobs.length === 0 ? (
            <EmptyState
              icon="🧵"
              title={t("jobs.noJobs")}
              description={t("jobs.noJobsHint")}
              action={
                <Link href="/auth/register/employer" className="btn btn-primary btn-sm">
                  {t("home.ctaEmployer")}
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {latestJobs.map((job) => (
                <JobListItem
                  key={job._id}
                  job={job}
                  locale={locale}
                  salaryLabel={t("jobs.salary")}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-x section">
        <div className="mb-10 max-w-xl">
          <p className="eyebrow">{t("home.howEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{t("home.howTitle")}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["how1", "how2", "how3"].map((key, index) => (
            <div key={key} className="relative overflow-hidden rounded-[16px] border border-line bg-white p-6">
              <span className="font-display text-4xl text-accent/25">0{index + 1}</span>
              <h3 className="mt-3 font-display text-xl text-ink">{t(`home.${key}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`home.${key}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Employer CTA with factory floor banner */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[20px] text-white">
          <Image
            src={HOME_MEDIA.employerCta}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07151f] via-[#0c1f2e]/90 to-[#0c1f2e]/55" />

          <div className="relative grid items-center gap-8 px-6 py-12 sm:px-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-soft">
                {t("home.employerEyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("home.employerTitle")}</h2>
              <p className="mt-3 max-w-lg text-white/75">{t("home.employerSub")}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/auth/register/employer" className="btn btn-primary">
                  {t("home.employerCta")}
                </Link>
                <Link href="/about" className="btn btn-ghost">
                  {t("nav.about")}
                </Link>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-white/85">
              {["employerPoint1", "employerPoint2", "employerPoint3", "employerPoint4"].map(
                (key) => (
                  <li key={key} className="flex gap-2.5">
                    <span className="text-accent-soft">✓</span>
                    <span>{t(`home.${key}`)}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
