import { database, bindings, getSettings, listProducts } from "../repository";
import { json } from "../http";
import {
  randomToken,
  digest,
  passwordHash,
  equal,
  sessionCookie,
  cookieToken,
} from "../security";
import { credentialsInput } from "../validation";
export async function authorized(req: Request) {
  const token = cookieToken(req);
  if (!token) return false;
  return !!(await database()
    .prepare("SELECT token FROM sessions WHERE token=? AND expires>?")
    .bind(await digest(token), Date.now())
    .first());
}
async function rate(req: Request) {
  const key = await digest(req.headers.get("cf-connecting-ip") || "shared");
  await database()
    .prepare("DELETE FROM attempts WHERE expires<?")
    .bind(Date.now())
    .run();
  const result = await database()
    .prepare(
      "INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(key, Date.now() + 900000)
    .first<{ count: number }>();
  return !!result && result.count <= 8;
}
export async function authRoutes(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "GET" && path === "session")
    return json({
      authenticated: await authorized(req),
      initialized: !!(await db
        .prepare("SELECT id FROM admins LIMIT 1")
        .first()),
    });
  if (method === "POST" && (path === "login" || path === "setup")) {
    if (!(await rate(req)))
      return json({ error: "محاولات كثيرة. حاول بعد 15 دقيقة." }, 429);
    const body = (await req.json()) as any;
    const { username, password } = credentialsInput(body);
    if (path === "setup") {
      if (await db.prepare("SELECT id FROM admins LIMIT 1").first())
        return json({ error: "تم إعداد الحساب مسبقاً." }, 409);
      if (
        !bindings().SETUP_TOKEN ||
        !equal(String(body.token || ""), bindings().SETUP_TOKEN!)
      )
        return json({ error: "رمز إعداد غير صحيح." }, 403);
      const salt = randomToken();
      await db
        .prepare("INSERT INTO admins(id,username,hash,salt) VALUES(?,?,?,?)")
        .bind("owner", username, await passwordHash(password, salt), salt)
        .run();
    } else {
      const admin = await db
        .prepare("SELECT hash,salt FROM admins WHERE username=?")
        .bind(username)
        .first<{ hash: string; salt: string }>();
      const calculated = await passwordHash(
        password,
        admin?.salt || "invalid-account-salt",
      );
      if (!admin || !equal(admin.hash, calculated))
        return json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة." }, 401);
    }
    const token = randomToken();
    await db
      .prepare("DELETE FROM sessions WHERE expires<?")
      .bind(Date.now())
      .run();
    await db
      .prepare("INSERT INTO sessions(token,expires) VALUES(?,?)")
      .bind(await digest(token), Date.now() + 28800000)
      .run();
    return json({ ok: true }, 200, {
      "Set-Cookie": sessionCookie(req, token),
    });
  }

  return undefined;
}
export async function accountRoutes(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "POST" && path === "logout") {
    await db
      .prepare("DELETE FROM sessions WHERE token=?")
      .bind(await digest(cookieToken(req)))
      .run();
    return json({ ok: true }, 200, {
      "Set-Cookie": sessionCookie(req, "", 0),
    });
  }
  if (method === "PUT" && path === "password") {
    const body = (await req.json()) as any;
    const admin = await db
      .prepare("SELECT * FROM admins WHERE id=?")
      .bind("owner")
      .first<any>();
    if (
      !equal(
        admin.hash,
        await passwordHash(String(body.currentPassword || ""), admin.salt),
      )
    )
      return json({ error: "كلمة المرور الحالية غير صحيحة." }, 400);
    const { password } = credentialsInput({
      username: admin.username,
      password: body.password,
    });
    const salt = randomToken();
    await db.batch([
      db
        .prepare("UPDATE admins SET hash=?,salt=? WHERE id=?")
        .bind(await passwordHash(password, salt), salt, "owner"),
      db.prepare("DELETE FROM sessions"),
    ]);
    return json({ ok: true }, 200, {
      "Set-Cookie": sessionCookie(req, "", 0),
    });
  }

  return undefined;
}
