import test from "node:test";
import assert from "node:assert/strict";
import {
  productInput,
  credentialsInput,
  whatsappLink,
} from "../lib/validation.ts";
import {
  passwordHash,
  equal,
  digest,
  randomToken,
  sessionCookie,
  cookieToken,
} from "../lib/security.ts";
test("WhatsApp receives exact phone, product and price including special characters", () => {
  const url = new URL(whatsappLink({ name: "كرسي & طاولة #1", price: 129.5 }));
  assert.equal(url.pathname, "/972594640044");
  assert.match(url.searchParams.get("text"), /كرسي & طاولة #1/);
  assert.match(url.searchParams.get("text"), /₪129.50/);
});
test("validation rejects unsafe images and invalid prices", () => {
  for (const image of [
    "javascript:alert(1)",
    "data:image/svg+xml,x",
    "//evil.test/image",
  ])
    assert.throws(() =>
      productInput({ name: "منتج", category: "عام", price: 1, image }),
    );
  for (const price of [-1, "abc", ""])
    assert.throws(() =>
      productInput({ name: "منتج", price, image: "https://example.com/a.jpg" }),
    );
  assert.equal(
    productInput({
      name: "  منتج ",
      price: 0,
      image: "https://example.com/a.jpg",
    }).name,
    "منتج",
  );
});
test("credentials require a strong minimum and valid username", () => {
  assert.throws(() =>
    credentialsInput({ username: "admin", password: "admin" }),
  );
  assert.throws(() =>
    credentialsInput({
      username: "<script>",
      password: "a-long-secret-password",
    }),
  );
  assert.equal(
    credentialsInput({ username: "OWNER", password: "a-long-secret-password" })
      .username,
    "owner",
  );
});
test("passwords are salted and verification rejects incorrect secrets", async () => {
  const salt = randomToken(),
    hash = await passwordHash("correct-password", salt);
  assert.ok(equal(hash, await passwordHash("correct-password", salt)));
  assert.ok(!equal(hash, await passwordHash("wrong-password", salt)));
  assert.notEqual(hash, await passwordHash("correct-password", randomToken()));
  assert.equal((await digest(randomToken())).length, 64);
});
test("session cookie is HttpOnly and secure on HTTPS", () => {
  const req = new Request("https://example.com", {
    headers: { cookie: "other=x; ha_session=abc" },
  });
  const cookie = sessionCookie(req, "abc");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.equal(cookieToken(req), "abc");
});
