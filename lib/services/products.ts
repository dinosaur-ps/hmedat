import { database, bindings, getSettings, listProducts } from "../repository";
import { json } from "../http";
import { demoProducts } from "../demo-products";
import { productInput } from "../validation";
export async function productRoutes(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "POST" && path === "demo") {
    if (await db.prepare("SELECT id FROM products LIMIT 1").first())
      return json(
        { error: "المنتجات التجريبية متاحة فقط عندما تكون القائمة فارغة." },
        409,
      );
    await db.batch([
      ...demoProducts.map(([name, price, image, category], i) =>
        db
          .prepare(
            "INSERT INTO products(id,name,price,image,category,active,sort,updated) VALUES(?,?,?,?,?,1,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            name,
            price,
            "https://images.unsplash.com/" +
              image +
              "?auto=format&fit=crop&w=800&q=85",
            category,
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
    if (method === "PUT") {
      const result = await db
        .prepare(
          "UPDATE products SET name=?,price=?,image=?,category=?,active=?,sort=?,updated=? WHERE id=?",
        )
        .bind(
          p.name,
          p.price,
          p.image,
          p.category,
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
          "INSERT INTO products(id,name,price,image,category,active,sort,updated) VALUES(?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          p.name,
          p.price,
          p.image,
          p.category,
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
