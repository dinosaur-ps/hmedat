import { getSettings, listProducts } from "@/lib/repository";
import { json } from "@/lib/http";
import { authRoutes, accountRoutes, authorized } from "@/lib/services/auth";
import { publicImages, uploadImages } from "@/lib/services/images";
import { productRoutes } from "@/lib/services/products";
import { settingsRoutes } from "@/lib/services/settings";
export const dynamic = "force-dynamic";
async function handle(req: Request) {
  try {
    const url = new URL(req.url),
      path = url.pathname.replace(/^\/api\//, ""),
      method = req.method;
    if (
      !["GET", "HEAD"].includes(method) &&
      req.headers.get("origin") !== url.origin
    )
      return json({ error: "طلب غير مسموح." }, 403);
    if (method === "GET" && path === "catalog")
      return json({
        products: await listProducts(),
        settings: await getSettings(),
      });
    const publicResponse =
      (await publicImages(req, path)) || (await authRoutes(req, path));
    if (publicResponse) return publicResponse;
    if (!(await authorized(req)))
      return json({ error: "يرجى تسجيل الدخول." }, 401);
    const response =
      (await accountRoutes(req, path)) ||
      (await uploadImages(req, path)) ||
      (await productRoutes(req, path)) ||
      (await settingsRoutes(req, path));
    return response || json({ error: "المسار غير موجود." }, 404);
  } catch (error) {
    if (error instanceof SyntaxError)
      return json({ error: "بيانات غير صالحة." }, 400);
    if (
      error instanceof Error &&
      /تحقق|أضف|اسم المستخدم|رابط الصورة/.test(error.message)
    )
      return json({ error: error.message }, 400);
    console.error(
      "API failure",
      error instanceof Error ? error.message : "unknown",
    );
    return json({ error: "تعذّر إتمام العملية. حاول مرة أخرى." }, 500);
  }
}
export const GET = handle,
  POST = handle,
  PUT = handle,
  DELETE = handle;
