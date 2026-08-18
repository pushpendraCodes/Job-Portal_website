"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

function RegisterChooser() {
  const t = useTranslations("auth");
  const search = useSearchParams();
  const router = useRouter();
  const preset = search.get("type");

  useEffect(() => {
    if (preset === "employer") router.replace("/auth/register/employer");
    if (preset === "seeker" || preset === "job_seeker") {
      router.replace("/auth/register/seeker");
    }
  }, [preset, router]);

  const cards = [
    {
      href: "/auth/register/seeker",
      icon: "🧑‍🏭",
      title: t("iAmSeeker"),
      body: t("seekerPitch"),
      points: [t("seekerPoint1"), t("seekerPoint2"), t("seekerPoint3")],
      cta: t("registerSeeker"),
      primary: true,
    },
    {
      href: "/auth/register/employer",
      icon: "🏭",
      title: t("iAmEmployer"),
      body: t("employerPitch"),
      points: [t("employerPoint1"), t("employerPoint2"), t("employerPoint3")],
      cta: t("registerEmployer"),
      primary: false,
    },
  ];

  return (
    <div className="mesh-bg min-h-[80vh] py-12 sm:py-16">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("joinUs")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{t("chooseType")}</h1>
          <p className="mt-3 text-ink-soft">{t("chooseTypeSub")}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="card card-hover flex flex-col p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent-tint text-2xl">
                {card.icon}
              </span>
              <h2 className="mt-4 font-display text-2xl text-ink">{card.title}</h2>
              <p className="mt-2 text-sm text-ink-soft">{card.body}</p>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-soft">
                {card.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    {point}
                  </li>
                ))}
              </ul>

              <span
                className={`btn mt-6 w-full ${card.primary ? "btn-primary" : "btn-outline"}`}
              >
                {card.cta} →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          {t("haveAccount")}{" "}
          <Link href="/auth/login" className="font-semibold text-accent hover:text-accent-deep">
            {t("loginTitle")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterChooserPage() {
  return (
    <Suspense fallback={<div className="container-x py-14" />}>
      <RegisterChooser />
    </Suspense>
  );
}
