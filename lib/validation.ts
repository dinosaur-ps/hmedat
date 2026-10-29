export const PHONE = "972594640044";
export function whatsappLink(
  product: { name: string; price: number },
  page?: string,
  phone = PHONE,
) {
  const message = `مرحباً، أنا مهتم بالمنتج:\nالاسم: ${product.name}\nالسعر: ₪${product.price.toFixed(2)}${page ? `\n${page}` : ""}`;
  const safePhone = /^\d{8,15}$/.test(phone) ? phone : PHONE;
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}
export function productInput(value: any) {
  const name = String(value.name || "").trim(),
    category = String(value.category || "عام").trim(),
    image = String(value.image || "").trim(),
    price = Number(value.price);
  if (
    !name ||
    name.length > 120 ||
    !category ||
    category.length > 50 ||
    value.price === "" ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 1000000
  )
    throw Error("تحقق من الاسم والفئة والسعر.");
  if (
    !/^https:\/\//i.test(image) &&
    !/^\/api\/images\/[a-f0-9-]+\.(jpg|png|webp)$/.test(image)
  )
    throw Error("أضف صورة أو رابط صورة آمن يبدأ بـ https.");
  if (image.length > 2000) throw Error("رابط الصورة طويل جداً.");
  return {
    name,
    category,
    image,
    price,
    active: value.active === false ? 0 : 1,
    sort: Number.isInteger(value.sort)
      ? Math.max(0, Math.min(9999, value.sort))
      : 0,
  };
}
export function credentialsInput(v: any) {
  const username = String(v.username || "")
      .trim()
      .toLowerCase(),
    password = String(v.password || "");
  if (
    !/^[a-z0-9_.-]{3,40}$/.test(username) ||
    password.length < 12 ||
    password.length > 128
  )
    throw Error(
      "اسم المستخدم من 3 إلى 40 حرفاً إنجليزياً، وكلمة المرور 12 حرفاً على الأقل.",
    );
  return { username, password };
}
