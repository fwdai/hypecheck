/** Stable anonymous id per browser (localStorage). */
export function getVisitorSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "hype_meter_visitor_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
