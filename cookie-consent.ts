export const COOKIE_KEY = "pc-cookie-consent-v2";
export type CookieChoice = "accepted" | "rejected";
export function readCookieChoice(value: string | null): CookieChoice | null {
  return value === "accepted" || value === "rejected" ? value : null;
}
export function analyticsAllowed(choice: CookieChoice | null): boolean {
  return choice === "accepted";
}
export function openCookiePreferences() {
  window.dispatchEvent(new Event("pagecraft:cookie-preferences"));
}