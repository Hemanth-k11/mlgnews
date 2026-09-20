import { cookies } from "next/headers";

// Likes need no account: a random id in this cookie identifies a browser.
export const VISITOR_COOKIE = "visitor_id";

// Returns this browser's visitor id, or "" if it hasn't liked anything yet.
export function getVisitorId() {
  const value = cookies().get(VISITOR_COOKIE)?.value || "";
  // The cookie is client-controlled, so only accept an id shaped like ours.
  return /^[0-9a-f-]{36}$/i.test(value) ? value : "";
}
