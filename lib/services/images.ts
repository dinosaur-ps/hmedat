import { database, bindings, getSettings, listProducts } from "../repository";
import { json } from "../http";
export async function publicImages(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "GET" && path.startsWith("images/")) {
    if (!/^images\/[a-f0-9-]+\.(jpg|png|webp)$/.test(path))
      return json({ error: "الصورة غير موجودة" }, 404);
    const object = await bindings().BUCKET.get(path.slice(7));
    if (!object) return json({ error: "الصورة غير موجودة" }, 404);
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "public,max-age=31536000,immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return undefined;
}
export async function uploadImages(req: Request, path: string) {
  const method = req.method,
    db = database();
  if (method === "POST" && path === "upload") {
    if (Number(req.headers.get("content-length") || 0) > 5500000)
      return json({ error: "الحد الأقصى للصورة 5 ميغابايت." }, 413);
    const form = await req.formData(),
      file = form.get("image");
    if (!(file instanceof File) || file.size > 5000000)
      return json({ error: "اختر صورة أقل من 5 ميغابايت." }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    let ext = "",
      type = "";
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
      ext = "jpg";
      type = "image/jpeg";
    } else if (
      [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)
    ) {
      ext = "png";
      type = "image/png";
    } else if (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    ) {
      ext = "webp";
      type = "image/webp";
    } else return json({ error: "الصور المسموحة: JPG، PNG، WEBP." }, 400);
    const key = `${crypto.randomUUID()}.${ext}`;
    await bindings().BUCKET.put(key, bytes, {
      httpMetadata: { contentType: type },
    });
    return json({ url: `/api/images/${key}` });
  }

  return undefined;
}
