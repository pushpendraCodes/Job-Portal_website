const EVENT = "loomhire:unread";

export function setUnreadCount(count: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { count: Math.max(0, count) } }));
}

export function onUnreadCount(listener: (count: number) => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const count = (event as CustomEvent<{ count?: number }>).detail?.count;
    if (typeof count === "number") listener(count);
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
