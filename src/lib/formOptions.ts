export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const COMPANY_TYPES = [
  { value: "proprietorship", labelEn: "Proprietorship", labelHi: "प्रोप्राइटरशिप" },
  { value: "partnership", labelEn: "Partnership", labelHi: "पार्टनरशिप" },
  { value: "pvt_ltd", labelEn: "Private Limited", labelHi: "प्राइवेट लिमिटेड" },
  { value: "llp", labelEn: "LLP", labelHi: "एलएलपी" },
  { value: "public_ltd", labelEn: "Public Limited", labelHi: "पब्लिक लिमिटेड" },
  { value: "other", labelEn: "Other", labelHi: "अन्य" },
];

export const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "201-500", "500+"];

export const INDUSTRY_TYPES = [
  { value: "hosiery", labelEn: "Hosiery", labelHi: "होज़री" },
  { value: "knitting", labelEn: "Knitting unit", labelHi: "निटिंग यूनिट" },
  { value: "dyeing", labelEn: "Dyeing & processing", labelHi: "डाइंग और प्रोसेसिंग" },
  { value: "garment", labelEn: "Garment manufacturing", labelHi: "गारमेंट मैन्युफैक्चरिंग" },
  { value: "spinning", labelEn: "Spinning mill", labelHi: "स्पिनिंग मिल" },
  { value: "weaving", labelEn: "Weaving", labelHi: "वीविंग" },
  { value: "export", labelEn: "Export house", labelHi: "एक्सपोर्ट हाउस" },
  { value: "trading", labelEn: "Trading / wholesale", labelHi: "ट्रेडिंग / होलसेल" },
];

export const QUALIFICATION_LEVELS = [
  { value: "below_10th", labelEn: "Below 10th", labelHi: "10वीं से कम" },
  { value: "10th", labelEn: "10th Pass", labelHi: "10वीं पास" },
  { value: "12th", labelEn: "12th Pass", labelHi: "12वीं पास" },
  { value: "iti", labelEn: "ITI / Diploma", labelHi: "आईटीआई / डिप्लोमा" },
  { value: "graduate", labelEn: "Graduate", labelHi: "स्नातक" },
  { value: "post_graduate", labelEn: "Post Graduate", labelHi: "परास्नातक" },
];

export const EMPLOYMENT_TYPES = [
  { value: "full_time", labelEn: "Full time", labelHi: "पूर्णकालिक" },
  { value: "part_time", labelEn: "Part time", labelHi: "अंशकालिक" },
  { value: "contract", labelEn: "Contract", labelHi: "अनुबंध" },
  { value: "daily_wage", labelEn: "Daily wage", labelHi: "दैनिक वेतन" },
  { value: "apprentice", labelEn: "Apprentice / Trainee", labelHi: "प्रशिक्षु" },
];

export const GENDERS = [
  { value: "male", labelEn: "Male", labelHi: "पुरुष" },
  { value: "female", labelEn: "Female", labelHi: "महिला" },
  { value: "other", labelEn: "Other", labelHi: "अन्य" },
];

export const MARITAL_STATUSES = [
  { value: "single", labelEn: "Single", labelHi: "अविवाहित" },
  { value: "married", labelEn: "Married", labelHi: "विवाहित" },
];

export const SKILL_SUGGESTIONS = [
  "Knitting machine operator",
  "Flat knitting",
  "Circular knitting",
  "Dyeing",
  "Fabric checking",
  "Cutting master",
  "Tailoring",
  "Overlock",
  "Flatlock",
  "Embroidery",
  "Printing",
  "Quality control",
  "Packing",
  "Merchandising",
  "Store keeping",
  "Production supervisor",
];

export const LANGUAGE_SUGGESTIONS = ["Hindi", "English", "Punjabi", "Bengali", "Tamil", "Gujarati"];

export function optionLabel(
  option: { labelEn: string; labelHi: string },
  locale: string,
): string {
  return locale === "hi" ? option.labelHi : option.labelEn;
}
