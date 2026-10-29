import { database, bindings, getSettings, listProducts } from "../repository";
import { json } from "../http";
import { demoDeadline, demoImage, demoProducts } from "../demo-products";
import { productInput } from "../validation";
export async function productRoutes(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "POST" && path === "demo") {
    const existing = await db.prepare("SELECT id,name FROM products").all<{ id: string; name: string }>();
    const legacyDemo = existing.results.length > 0 && existing.results.every((p) => p.name.includes("· דוגמה"));
    if (existing.results.length && !legacyDemo)
      return json(
        { error: "المنتجات التجريبية متاحة فقط عندما تكون القائمة فارغة." },
        409,
      );
    await db.batch([
      ...(legacyDemo ? [db.prepare("DELETE FROM products")] : []),
      ...demoProducts.map((product, i) =>
        db
          .prepare(
            "INSERT INTO products(id,name,price,original_price,image,category,description,badge,featured,deal_end,active,sort,updated) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            product.name,
            product.price,
            product.originalPrice,
            demoImage(product.image),
            product.category,
            product.description,
            product.badge,
            product.featured ? 1 : 0,
            product.featured ? demoDeadline() : null,
            i,
            new Date().toISOString(),
          ),
      ),
      db
        .prepare(
          "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .bind("notice", "קולקציית הדגמה · מוצרים ומחירים להמחשה בלבד"),
    ]);
    return json({ ok: true });
  }
  if (
    (method === "POST" || method === "PUT") &&
    (path === "products" || /^products\/[a-f0-9-]+$/.test(path))
  ) {
    const p = productInput(await req.json()),
      id = method === "POST" ? crypto.randomUUID() : path.split("/")[1];
    if (p.featured)
      await db.prepare("UPDATE products SET featured=0").run();
    if (method === "PUT") {
      const result = await db
        .prepare(
          "UPDATE products SET name=?,price=?,original_price=?,image=?,category=?,description=?,badge=?,featured=?,deal_end=?,active=?,sort=?,updated=? WHERE id=?",
        )
        .bind(
          p.name,
          p.price,
          p.originalPrice,
          p.image,
          p.category,
          p.description,
          p.badge,
          p.featured,
          p.dealEnd,
          p.active,
          p.sort,
          new Date().toISOString(),
          id,
        )
        .run();
      if (!result.meta.changes)
        return json({ error: "المنتج غير موجود." }, 404);
    } else
      await db
        .prepare(
          "INSERT INTO products(id,name,price,original_price,image,category,description,badge,featured,deal_end,active,sort,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          p.name,
          p.price,
          p.originalPrice,
          p.image,
          p.category,
          p.description,
          p.badge,
          p.featured,
          p.dealEnd,
          p.active,
          p.sort,
          new Date().toISOString(),
        )
        .run();
    return json({ ok: true, id });
  }
  if (method === "DELETE" && /^products\/[a-f0-9-]+$/.test(path)) {
    await db
      .prepare("DELETE FROM products WHERE id=?")
      .bind(path.split("/")[1])
      .run();
    return json({ ok: true });
  }

  return undefined;
}
