"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import { Alert } from "@/components/ui/Alert";
import { Field } from "@/components/ui/Field";

type AccountType = "employer" | "job_seeker";

export function OtpStep({
  accountType,
  mobile,
  mode = "login",
  onMobileChange,
  onVerified,
}: {
  accountType: AccountType;
  mobile: string;
  mode?: "login" | "register";
  onMobileChange: (value: string) => void;
  onVerified: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
}) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const mobileValid = /^[6-9]\d{9}$/.test(mobile);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resolveError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { code?: string; message?: string } | undefined;
      if (data?.code === "MOBILE_ALREADY_REGISTERED") {
        const translated = t("mobileAlreadyRegistered");
        // Avoid showing raw key if messages JSON was not reloaded yet
        if (
          translated &&
          translated !== "mobileAlreadyRegistered" &&
          translated !== "auth.mobileAlreadyRegistered"
        ) {
          return translated;
        }
        return (
          data.message ||
          "This mobile number is already registered. Please login instead."
        );
      }
    }
    return getErrorMessage(err);
  };

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<ApiSuccess<{ mockOtp?: string }>>("/auth/otp/request", {
        accountType,
        mobile,
        intent: mode,
      });
      setMockOtp(data.data.mockOtp ?? null);
      setSent(true);
      setCooldown(30);
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<
        ApiSuccess<{ user: AuthUser; accessToken: string; refreshToken: string }>
      >("/auth/otp/verify", { accountType, mobile, otp });
      onVerified(data.data);
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field
        label={t("mobile")}
        required
        error={mobile.length === 10 && !mobileValid ? t("invalidMobile") : undefined}
        hint={t("mobileHint")}
      >
        <div className="flex min-w-0 items-stretch gap-2">
          <span className="flex shrink-0 items-center rounded-[12px] border border-line bg-mist px-2.5 text-sm font-semibold text-ink-soft sm:px-3">
            +91
          </span>
          <input
            className="input min-w-0"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98765 43210"
            value={mobile}
            maxLength={10}
            disabled={sent}
            onChange={(e) => onMobileChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        </div>
      </Field>

      {!sent ? (
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={loading || !mobileValid}
          onClick={() => void sendOtp()}
        >
          {loading ? tc("loading") : t("sendOtp")}
        </button>
      ) : (
        <>
          <Field label={t("otp")} required hint={t("otpHint", { mobile })}>
            <input
              className="input otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </Field>

          {mockOtp && (
            <Alert tone="info">
              {t("mockHint")}: <strong>{mockOtp}</strong>
            </Alert>
          )}

          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={loading || otp.length < 4}
            onClick={() => void verify()}
          >
            {loading ? tc("loading") : t("verifyOtp")}
          </button>

          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="font-semibold text-ink-soft hover:text-ink"
              onClick={() => {
                setSent(false);
                setOtp("");
                setMockOtp(null);
              }}
            >
              {t("changeNumber")}
            </button>
            <button
              type="button"
              className="font-semibold text-accent disabled:text-ink-mute"
              disabled={cooldown > 0 || loading}
              onClick={() => void sendOtp()}
            >
              {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resendOtp")}
            </button>
          </div>
        </>
      )}

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
