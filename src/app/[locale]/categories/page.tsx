import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HOME_MEDIA } from "@/lib/homeMedia";
import type { ApiSuccess } from "@/lib/api";
import type { JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function fetchCategories(): Promise<JobCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = (await res.json()) as ApiSuccess<JobCategory[]>;
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const categories = await fetchCategories();

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("categoriesPage.eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            {t("categoriesPage.title")}
          </h1>
          <p className="mt-2 text-ink-soft">{t("categoriesPage.subtitle")}</p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon="🧵"
              title={t("categoriesPage.empty")}
              description={t("categoriesPage.emptyHint")}
              action={
                <Link href="/jobs" className="btn btn-primary btn-sm">
                  {t("home.ctaJobs")}
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <article
                key={category._id}
                className="overflow-hidden rounded-[16px] border border-line bg-white shadow-sm"
              >
                <Link
                  href={`/jobs?categoryId=${category._id}`}
                  className="group block"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={
                        category.iconUrl ||
                        HOME_MEDIA.categoryImages[index % HOME_MEDIA.categoryImages.length]
                      }
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f2e]/70 to-transparent" />
                    <h2 className="absolute bottom-3 left-4 right-4 font-display text-xl text-white">
                      {categoryName(category, locale)}
                    </h2>
                  </div>
                </Link>

                <div className="p-4">
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/jobs?categoryId=${category._id}&subcategoryId=${sub._id}`}
                          className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-accent hover:text-accent"
                        >
                          {categoryName(sub, locale)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft">{t("categoriesPage.noSubs")}</p>
                  )}

                  <Link
                    href={`/jobs?categoryId=${category._id}`}
                    className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline"
                  >
                    {t("categoriesPage.browseJobs")} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
