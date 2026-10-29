const encoder = new TextEncoder();
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
}
export async function digest(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(value)),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
}
export function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++)
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
export function sessionCookie(request: Request, token: string, maxAge = 28800) {
  return `ha_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function cookieToken(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("ha_session="))
      ?.slice(11) || ""
  );
}
