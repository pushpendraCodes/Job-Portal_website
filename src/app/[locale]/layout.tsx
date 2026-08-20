import { Noto_Serif, Noto_Serif_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { StoreProvider } from "@/store/StoreProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PushRegistrar } from "@/components/PushRegistrar";
import "../globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const brand = process.env.NEXT_PUBLIC_APP_NAME || "LoomHire";
  return {
    title: {
      default: `${brand} — Textile & Hosiery Jobs`,
      template: `%s · ${brand}`,
    },
    description:
      locale === "hi"
        ? "होज़री और टेक्सटाइल उद्योग के लिए जॉब पोर्टल"
        : "Job portal dedicated to hosiery and textile industry careers",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${notoSerif.variable} ${notoSerifDevanagari.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <PushRegistrar />
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
