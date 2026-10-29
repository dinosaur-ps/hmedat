import { database, bindings, getSettings, listProducts } from "../repository";
import { json } from "../http";
export async function settingsRoutes(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "GET" && path === "admin")
    return json({
      products: await listProducts(true),
      settings: await getSettings(),
    });
  if (method === "PUT" && path === "settings") {
    const value = (await req.json()) as Record<string, unknown>;
    const allowed = [
      "title",
      "brandLatin",
      "navLabel",
      "contactLinkLabel",
      "subtitle",
      "heroEyebrow",
      "heroTitle",
      "heroText",
      "heroButton",
      "heroNote",
      "heroImage",
      "heroImageAlt",
      "photoCaption",
      "heroSeal",
      "ribbon1",
      "ribbon2",
      "ribbon3",
      "catalogEyebrow",
      "catalogTitle",
      "searchPlaceholder",
      "productAction",
      "emptySearch",
      "emptyCatalog",
      "contactEyebrow",
      "contactTitle",
      "contactText",
      "contactButton",
      "adminLink",
      "whatsappNumber",
      "notice",
      "footer",
    ];
    const entries = Object.entries(value).filter(([k]) => allowed.includes(k));
    if (!entries.length)
      return json({ error: "لم يتم إرسال إعدادات صالحة." }, 400);
    if (
      entries.some(
        ([key, v]) =>
          typeof v !== "string" ||
          !v.trim() ||
          v.length > (key === "heroImage" ? 2000 : 500),
      )
    )
      return json({ error: "النصوص مطلوبة وبحد أقصى 500 حرف." }, 400);
    const values = Object.fromEntries(entries) as Record<string, string>;
    if (
      values.whatsappNumber &&
      !/^\d{8,15}$/.test(values.whatsappNumber.replace(/^00/, ""))
    )
      return json(
        { error: "رقم واتساب يجب أن يحتوي أرقاماً فقط مع رمز الدولة." },
        400,
      );
    if (
      values.heroImage &&
      !/^https:\/\//i.test(values.heroImage) &&
      !/^\/api\/images\/[a-f0-9-]+\.(jpg|png|webp)$/.test(values.heroImage)
    )
      return json(
        { error: "صورة الغلاف يجب أن تكون ملفاً مرفوعاً أو رابط HTTPS." },
        400,
      );
    if (values.whatsappNumber)
      values.whatsappNumber = values.whatsappNumber.replace(/^00/, "");
    await db.batch(
      entries.map(([k, v]) =>
        db
          .prepare(
            "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .bind(k, values[k]),
      ),
    );
    return json({ ok: true });
  }

  return undefined;
}
