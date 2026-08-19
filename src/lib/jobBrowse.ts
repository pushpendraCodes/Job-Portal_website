/**
 * Visual helpers for the jobs browser.
 * The audience is largely low-literacy hosiery workers, so every filter is
 * paired with a picture so it can be recognised without reading.
 */

/** Emoji shown next to each trade so workers recognise it without reading. */
const CATEGORY_ICONS: Record<string, string> = {
  "helper-labour": "💪",
  "yarn-spinning": "🧶",
  knitting: "🧵",
  "dyeing-processing": "🎨",
  finishing: "✨",
  cutting: "✂️",
  "stitching-sewing": "🪡",
  "checking-quality": "🔍",
  "ironing-packing": "📦",
  "machine-maintenance": "🔧",
  "design-sampling": "✏️",
  merchandising: "📋",
  "production-planning": "🏭",
  "sales-marketing": "📈",
  "purchase-sourcing": "🛒",
  "store-inventory": "🏬",
  "hr-admin": "👥",
  "accounts-finance": "💰",
  "logistics-transport": "🚚",
  "it-systems": "💻",
  "security-other": "🛡️",
};

export function categoryIcon(slug?: string): string {
  if (!slug) return "🏭";
  return CATEGORY_ICONS[slug] ?? "🏭";
}

/** Textile / hosiery hubs offered as one-tap chips instead of typing. */
export const POPULAR_CITIES = [
  "Ludhiana",
  "Tirupur",
  "Surat",
  "Kanpur",
  "Coimbatore",
  "Delhi",
  "Ahmedabad",
  "Jaipur",
  "Indore",
  "Bengaluru",
];

/** Minimum-salary buckets shown as big buttons. */
export const SALARY_STEPS = [
  { value: "10000", labelEn: "₹10,000+", labelHi: "₹10,000+" },
  { value: "15000", labelEn: "₹15,000+", labelHi: "₹15,000+" },
  { value: "20000", labelEn: "₹20,000+", labelHi: "₹20,000+" },
  { value: "30000", labelEn: "₹30,000+", labelHi: "₹30,000+" },
];

/** One-tap shortcuts under the hero search, and in the home page ticker. */
export const TRENDING_SEARCHES = [
  { query: "tailor", icon: "🪡", labelEn: "Tailor", labelHi: "टेलर" },
  { query: "knitting", icon: "🧵", labelEn: "Knitting operator", labelHi: "निटिंग ऑपरेटर" },
  { query: "helper", icon: "💪", labelEn: "Helper", labelHi: "हेल्पर" },
  { query: "checker", icon: "🔍", labelEn: "Checker", labelHi: "चेकर" },
  { query: "packing", icon: "📦", labelEn: "Packing", labelHi: "पैकिंग" },
  { query: "supervisor", icon: "📋", labelEn: "Supervisor", labelHi: "सुपरवाइज़र" },
  { query: "dyeing", icon: "🎨", labelEn: "Dyeing", labelHi: "डाइंग" },
  { query: "cutting master", icon: "✂️", labelEn: "Cutting master", labelHi: "कटिंग मास्टर" },
  { query: "embroidery", icon: "🧶", labelEn: "Embroidery", labelHi: "कढ़ाई" },
  { query: "mechanic", icon: "🔧", labelEn: "Mechanic", labelHi: "मैकेनिक" },
];

/** Compact salary text, e.g. "₹12,000 – ₹18,000". */
export function shortSalary(job: {
  salaryMin?: number;
  salaryMax?: number;
}): string | null {
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `${fmt(job.salaryMin)}+`;
  if (job.salaryMax) return fmt(job.salaryMax);
  return null;
}
