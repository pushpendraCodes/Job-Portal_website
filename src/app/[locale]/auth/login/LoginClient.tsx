"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { AuthUser } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { OtpStep } from "@/components/auth/OtpStep";

type LoginType = "employer" | "job_seeker";

export default function LoginClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const search = useSearchParams();
  const dispatch = useAppDispatch();

  const initialType = (search.get("type") as LoginType) || "job_seeker";
  const next = search.get("next");
  const [accountType, setAccountType] = useState<LoginType>(
    initialType === "employer" ? "employer" : "job_seeker",
  );
  const [mobile, setMobile] = useState("");

  const onVerified = (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => {
    dispatch(setCredentials(payload));

    if (payload.user.registrationPending) {
      router.push(
        accountType === "employer" ? "/auth/register/employer" : "/auth/register/seeker",
      );
      return;
    }

    router.push(next || (accountType === "employer" ? "/employer" : "/seeker"));
  };

  return (
    <div className="mesh-bg flex min-h-[80vh] items-center py-12">
      <div className="container-x flex justify-center">
        <div className="panel w-full max-w-md p-7 sm:p-9">
          <p className="eyebrow">{t("welcomeBack")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t("loginSub")}</p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-mist p-1">
            {(["job_seeker", "employer"] as LoginType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  accountType === type ? "bg-white text-ink shadow-sm" : "text-ink-soft"
                }`}
                onClick={() => setAccountType(type)}
              >
                {type === "employer" ? t("iAmEmployer") : t("iAmSeeker")}
              </button>
            ))}
          </div>

          <div className="mt-7">
            <OtpStep
              key={accountType}
              accountType={accountType}
              mobile={mobile}
              onMobileChange={setMobile}
              onVerified={onVerified}
            />
          </div>

          <p className="mt-7 border-t border-line-soft pt-5 text-center text-sm text-ink-soft">
            {t("noAccount")}{" "}
            <Link
              href={
                accountType === "employer"
                  ? "/auth/register/employer"
                  : "/auth/register/seeker"
              }
              className="font-semibold text-accent hover:text-accent-deep"
            >
              {accountType === "employer" ? t("registerEmployer") : t("registerSeeker")} →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
