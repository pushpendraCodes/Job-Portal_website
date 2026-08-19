import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobListItem } from "@/components/JobListItem";
import { HeroSearch } from "@/components/HeroSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { HOME_MEDIA } from "@/lib/homeMedia";
import { TRENDING_SEARCHES, categoryIcon } from "@/lib/jobBrowse";
import { optionLabel } from "@/lib/formOptions";
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

const STATS = [
  { value: 12000, suffix: "+", key: "statSeekers", icon: "👷" },
  { value: 800, suffix: "+", key: "statEmployers", icon: "🏭" },
  { value: 40, suffix: "+", key: "statCities", icon: "📍" },
  { value: 100, suffix: "%", key: "statFree", icon: "🎁" },
];

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
      {/* Hero — full-bleed mill visual that the transparent header floats over */}
      <section className="relative min-h-[86vh] overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="ken-burns object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07151f] via-[#0c1f2e]/92 to-[#0c1f2e]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,31,0.65)_0%,transparent_28%,transparent_55%,rgba(7,21,31,0.6))]" />

        <div className="container-x relative flex min-h-[86vh] flex-col justify-center pb-16 pt-28 sm:pb-20 sm:pt-32">
          <span className="fade-up inline-flex w-fit items-center gap-2 rounded-full border border-accent-soft/30 bg-accent-soft/10 px-3.5 py-1.5 text-xs font-semibold text-accent-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-soft opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-soft" />
            </span>
            {t("home.badge")}
          </span>

          <h1 className="fade-up-delay mt-5 max-w-3xl font-display text-[2rem] leading-[1.12] sm:text-5xl md:text-6xl">
            {t("home.headline")}
          </h1>
          <p className="fade-up-delay-2 mt-4 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            {t("home.sub")}
          </p>

          <div className="fade-up-delay-2 mt-8 max-w-3xl">
            <HeroSearch />
          </div>

          <div className="fade-up-delay-2 mt-7 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn btn-ghost">
              {t("home.ctaJobs")} →
            </Link>
            <Link href="/auth/register/employer" className="btn btn-primary">
              {t("home.ctaEmployer")}
            </Link>
          </div>

          <dl className="fade-up-delay-2 mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.key}
                className="glass-tile px-4 py-3.5"
                style={{ animationDelay: `${index * 220}ms` }}
              >
                <span aria-hidden="true" className="text-lg">
                  {stat.icon}
                </span>
                <dt className="mt-1 font-display text-2xl text-white sm:text-[1.75rem]">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="mt-0.5 text-xs text-white/65">{t(`home.${stat.key}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trending trades ticker */}
      <div className="border-y border-line bg-white py-3">
        <div className="marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
              {TRENDING_SEARCHES.map((item) => (
                <Link
                  key={`${copy}-${item.query}`}
                  href={`/jobs?q=${encodeURIComponent(item.query)}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-accent hover:bg-accent-tint hover:text-accent-deep"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {optionLabel(item, locale)}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Industry floors banner */}
      <section className="bg-[#0c1f2e] text-white">
        <div className="container-x py-14 sm:py-20">
          <Reveal className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-soft">
              {t("home.industryEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("home.industryTitle")}</h2>
            <p className="mt-2 text-white/70">{t("home.industrySub")}</p>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_MEDIA.floors.map((floor, index) => {
              const copy = FLOOR_COPY[floor.key];
              return (
                <Reveal key={floor.key} delay={index * 90}>
                  <Link
                    href={`/jobs?q=${encodeURIComponent(floor.query)}`}
                    className="group relative block min-h-[240px] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={floor.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-110"
                      priority={index < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07151f] via-[#07151f]/55 to-transparent transition duration-500 group-hover:from-[#07151f] group-hover:via-[#07151f]/70" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-display text-xl text-white">{t(`home.${copy.title}`)}</h3>
                      <p className="mt-1 text-sm text-white/70">{t(`home.${copy.hint}`)}</p>
                      <span className="mt-3 inline-flex translate-y-1 items-center gap-1.5 text-sm font-semibold text-accent-soft opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {t("home.viewAll")} →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="container-x section">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">{t("home.categoriesEyebrow")}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{t("home.categoriesTitle")}</h2>
              <p className="mt-2 text-ink-soft">{t("home.categoriesSub")}</p>
            </div>
            <Link href="/categories" className="btn btn-outline btn-sm">
              {t("home.viewAllCategories")} →
            </Link>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topCategories.map((category, index) => (
              <Reveal key={category._id} delay={index * 70}>
                <Link
                  href={`/jobs?categoryId=${category._id}`}
                  className="shine group relative block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
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
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[#0c1f2e]/35 transition group-hover:bg-[#0c1f2e]/20" />
                    <span className="absolute bottom-2 left-3 text-2xl drop-shadow-lg">
                      {categoryIcon(category.slug)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-4">
                    <div className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {categoryName(category, locale)}
                      </span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {t("home.subcategoryCount", { count: category.subcategories.length })}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-ink-mute transition duration-300 group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Latest jobs */}
      <section className="mesh-bg">
        <div className="container-x section">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
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
          </Reveal>

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
              {latestJobs.map((job, index) => (
                <Reveal key={job._id} delay={index * 60}>
                  <JobListItem job={job} locale={locale} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-x section">
        <Reveal className="mb-10 max-w-xl">
          <p className="eyebrow">{t("home.howEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{t("home.howTitle")}</h2>
        </Reveal>

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Thread connecting the three steps on wide screens. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 hidden border-t border-dashed border-line md:block"
          />
          {["how1", "how2", "how3"].map((key, index) => (
            <Reveal key={key} delay={index * 110} className="relative">
              <div className="step-card h-full">
                <div className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg text-white shadow-md">
                    {index + 1}
                  </span>
                  <span className="font-display text-4xl text-accent/15">0{index + 1}</span>
                </div>
                <h3 className="relative mt-4 font-display text-xl text-ink">
                  {t(`home.${key}Title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">
                  {t(`home.${key}Body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center" delay={120}>
          <Link href="/auth/register/seeker" className="btn btn-primary">
            {t("auth.iAmSeeker")} →
          </Link>
        </Reveal>
      </section>

      {/* Employer CTA with factory floor banner */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] text-white">
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

              <ul className="glass-tile float-slow space-y-3 p-6 text-sm text-white/85">
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
        </Reveal>
      </section>
    </>
  );
}
