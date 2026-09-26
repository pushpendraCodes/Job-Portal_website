export type PortalNotification = {
  _id: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    link?: string;
    event?: string;
    jobId?: string;
    applicationId?: string;
    employerUserId?: string;
  };
};

export function notificationTitle(item: PortalNotification, locale: string) {
  return locale === "hi" && item.titleHi ? item.titleHi : item.titleEn;
}

export function notificationBody(item: PortalNotification, locale: string) {
  return locale === "hi" && item.bodyHi ? item.bodyHi : item.bodyEn;
}

export function notificationHref(item: PortalNotification) {
  if (item.data?.link) return item.data.link;
  if (item.data?.jobId && item.type === "new_job_alert") return `/jobs/${item.data.jobId}`;
  if (item.type === "job_application") return "/employer/jobs";
  if (item.type === "job_approved" || item.type === "job_rejected") return "/employer/jobs";
  return "/notifications";
}
