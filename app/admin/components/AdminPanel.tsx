"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, type Product } from "@/lib/client";
const blank = {
  name: "",
  price: "",
  originalPrice: "",
  image: "",
  category: "عام",
  description: "",
  badge: "מבצע",
  featured: false,
  dealEnd: "",
  active: true,
  sort: 0,
};
export default function Admin({ setup = false }: { setup?: boolean }) {
  const [ready, setReady] = useState(false),
    [authenticated, setAuthenticated] = useState(false),
    [initialized, setInitialized] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [products, setProducts] = useState<Product[]>([]),
    [settings, setSettings] = useState<Record<string, string>>({}),
    [tab, setTab] = useState("products"),
    [editing, setEditing] = useState<string | null>(null),
    [form, setForm] = useState<any>(blank),
    [filter, setFilter] = useState(""),
    [uploading, setUploading] = useState(false),
    [setupToken, setSetupToken] = useState("");
  useEffect(() => {
    if (setup) {
      setSetupToken(location.hash.slice(1));
      history.replaceState(null, "", location.pathname);
    }
    api("session")
      .then((s) => {
        setAuthenticated(s.authenticated);
        setInitialized(s.initialized);
        setReady(true);
        if (s.authenticated) load();
      })
      .catch((e) => {
        setError(e.message);
        setReady(true);
      });
  }, []);
  async function load() {
    const data = await api("admin");
    setProducts(data.products);
    setSettings(data.settings);
  }
  async function task(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await task(async () => {
      await api(setup && !initialized ? "setup" : "login", {
        method: "POST",
        body: JSON.stringify({
          username: fd.get("username"),
          password: fd.get("password"),
          token: setupToken || fd.get("token"),
        }),
      });
      setAuthenticated(true);
      setInitialized(true);
      await load();
      if (setup) history.replaceState(null, "", "/admin");
    });
  }
  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    await task(async () => {
      await api(editing ? `products/${editing}` : "products", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: Number(form.originalPrice || form.price),
          sort: Number(form.sort),
        }),
      });
      await load();
      setForm(blank);
      setEditing(null);
      setMessage("تم حفظ المنتج بنجاح.");
    });
  }
  const feedback = (
    <>
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="feedback success" role="status">
          {message}
        </p>
      )}
    </>
  );
  if (!ready)
    return (
      <main className="admin-shell" dir="rtl" lang="ar">
        <p role="status">جارٍ التحميل…</p>
      </main>
    );
  if (!authenticated)
    return (
      <main className="login-shell" dir="rtl" lang="ar">
        <a className="brand" href="/">
          הזדמנות אחרונה
        </a>
        <form className="panel login-form" onSubmit={login}>
          <p className="eyebrow">لوحة تحكم الموقع</p>
          <h1>
            {setup && !initialized ? "إعداد حساب المدير" : "أهلاً بعودتك"}
          </h1>
          <p>
            {setup && !initialized
              ? "اختر بيانات الدخول الخاصة بك. الإعداد متاح لمرة واحدة فقط."
              : "سجّل دخولك لإدارة المنتجات والمعلومات."}
          </p>
          {feedback}
          {setup && !initialized && !setupToken && (
            <label>
              رمز الإعداد
              <input name="token" required autoComplete="off" />
            </label>
          )}
          <label>
            اسم المستخدم
            <input
              name="username"
              required
              minLength={3}
              maxLength={40}
              pattern="[a-zA-Z0-9_.-]+"
              autoComplete="username"
              dir="ltr"
            />
          </label>
          <label>
            كلمة المرور
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={
                setup && !initialized ? "new-password" : "current-password"
              }
              dir="ltr"
            />
          </label>
          <small>كلمة المرور 12 حرفاً على الأقل.</small>
          <button className="primary" disabled={busy}>
            {busy
              ? "جارٍ التحقق…"
              : setup && !initialized
                ? "إنشاء حساب المدير"
                : "تسجيل الدخول"}
          </button>
          {!initialized && !setup && (
            <p>الحساب غير مهيأ. استخدم رابط الإعداد الخاص بمالك الموقع.</p>
          )}
        </form>
        <a href="/">العودة إلى الموقع ↗</a>
      </main>
    );
  return (
    <main className="admin-shell" dir="rtl" lang="ar">
      <header className="admin-header">
        <div>
          <p className="eyebrow">HAZDMANUT AHARONA</p>
          <h1>لوحة التحكم</h1>
        </div>
        <div className="row">
          <a href="/" target="_blank" className="outline-link">
            عرض الموقع ↗
          </a>
          <button
            disabled={busy}
            onClick={() =>
              task(async () => {
                await api("logout", { method: "POST" });
                setAuthenticated(false);
              })
            }
          >
            تسجيل الخروج
          </button>
        </div>
      </header>
      <div className="admin-tabs">
        {[
          ["products", "المنتجات"],
          ["settings", "معلومات الموقع"],
          ["security", "كلمة المرور"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => {
              setTab(id);
              setError("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {feedback}
      {tab === "products" && (
        <>
          <div className="stats">
            <span>
              <strong>{products.length}</strong> إجمالي المنتجات
            </span>
            <span>
              <strong>{products.filter((p) => p.active).length}</strong> معروضة
              بالموقع
            </span>
            <span>
              الواتساب{" "}
              <b dir="ltr">+{settings.whatsappNumber || "972594640044"}</b>
            </span>
          </div>
          <div className="admin-columns">
            <form className="panel product-form" onSubmit={saveProduct}>
              <h2>{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
              <label>
                اسم المنتج
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <div className="two-fields">
                <label>
                  سعر العرض بالشيكل
                  <input
                    type="number"
                    required
                    min="0"
                    max="1000000"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </label>
                <label>
                  السعر قبل الخصم
                  <input type="number" required min="0" max="1000000" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                </label>
              </div>
              <label>
                وصف قصير
                <textarea maxLength={240} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="two-fields">
                <label>
                  الفئة
                  <input
                    required
                    maxLength={50}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </label>
                <label>
                  شارة العرض
                  <input maxLength={40} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </label>
              </div>
              <label>
                صورة المنتج
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading || busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5000000) {
                      setError("الصورة يجب أن تكون أقل من 5 ميغابايت.");
                      return;
                    }
                    setUploading(true);
                    setError("");
                    try {
                      const fd = new FormData();
                      fd.append("image", file);
                      const result = await api("upload", {
                        method: "POST",
                        body: fd,
                      });
                      setForm((v: any) => ({ ...v, image: result.url }));
                    } catch (err) {
                      setError((err as Error).message);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <small>
                  JPG، PNG، WEBP · حتى 5 ميغابايت{" "}
                  {uploading ? "· جارٍ الرفع…" : ""}
                </small>
              </label>
              <label>
                أو رابط صورة HTTPS
                <input
                  value={form.image}
                  required
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  dir="ltr"
                />
              </label>
              {form.image && (
                <img
                  className="image-preview"
                  src={form.image}
                  alt="معاينة صورة المنتج"
                />
              )}
              <div className="two-fields">
                <label>
                  ترتيب العرض
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={form.sort}
                    onChange={(e) => setForm({ ...form, sort: e.target.value })}
                  />
                  <small>الأصغر يظهر أولاً.</small>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                  />{" "}
                  إظهار بالموقع
                </label>
              </div>
              <div className="two-fields">
                <label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> عرض رئيسي مع عداد</label>
                {form.featured && <label>ينتهي العرض في<input type="datetime-local" required value={form.dealEnd} onChange={(e) => setForm({ ...form, dealEnd: e.target.value })} /></label>}
              </div>
              <div className="row">
                <button className="primary" disabled={busy || uploading}>
                  {busy
                    ? "جارٍ الحفظ…"
                    : editing
                      ? "حفظ التعديلات"
                      : "إضافة المنتج"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm(blank);
                    }}
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
            <section className="panel">
              <div className="section-heading">
                <h2>قائمة المنتجات</h2>
                <input
                  aria-label="البحث بالمنتجات"
                  placeholder="ابحث عن منتج…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              {(!products.length || products.every((p) => p.name.includes("· דוגמה"))) && (
                <div className="empty">
                  أضف باقة العروض التجريبية الجديدة، ويمكنك تعديلها مباشرة.
                  <br />
                  <button
                    disabled={busy}
                    onClick={() =>
                      task(async () => {
                        await api("demo", { method: "POST" });
                        await load();
                        setMessage(
                          "تمت إضافة أمثلة. استبدل المعلومات والصور قبل الإطلاق.",
                        );
                      })
                    }
                  >
                    إضافة 12 منتجاً تجريبياً
                  </button>
                </div>
              )}
              <div className="admin-list">
                {products
                  .filter((p) => p.name.includes(filter))
                  .map((p) => (
                    <article className="admin-product" key={p.id}>
                      <img src={p.image} alt="" />
                      <div className="grow">
                        <strong>{p.name}</strong>
                        <p>
                          ₪{p.price} <del>₪{p.originalPrice}</del> · {p.category} ·{" "}
                          {p.active ? "ظاهر" : "مخفي"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setForm({
                            ...p,
                            price: String(p.price),
                            originalPrice: String(p.originalPrice),
                            dealEnd: p.dealEnd ? new Date(p.dealEnd - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        className="danger"
                        disabled={busy}
                        onClick={() => {
                          if (confirm(`حذف المنتج «${p.name}»؟`))
                            task(async () => {
                              await api(`products/${p.id}`, {
                                method: "DELETE",
                              });
                              await load();
                              if (editing === p.id) {
                                setEditing(null);
                                setForm(blank);
                              }
                              setMessage("تم حذف المنتج.");
                            });
                        }}
                      >
                        حذف
                      </button>
                    </article>
                  ))}
              </div>
            </section>
          </div>
        </>
      )}
      {tab === "settings" && (
        <form
          className="panel settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            task(async () => {
              await api("settings", {
                method: "PUT",
                body: JSON.stringify(settings),
              });
              setMessage("تم تحديث معلومات الموقع.");
            });
          }}
        >
          <h2>تعديل جميع عناصر الصفحة الرئيسية</h2>
          <p className="settings-help">
            كل حقل مرتبط مباشرة بالواجهة. يمكنك تعديل النصوص والصورة ورقم واتساب
            والدومين دون تعديل الملفات.
          </p>
          {[
            {
              title: "الهوية والتنقل",
              fields: [
                ["title", "اسم الموقع"],
                ["brandLatin", "الاسم الإنجليزي الصغير"],
                ["notice", "الشريط العلوي"],
                ["navLabel", "رابط الانتقال للمنتجات"],
                ["contactLinkLabel", "رابط التواصل أعلى الصفحة"],
              ],
            },
            {
              title: "الواجهة الرئيسية",
              fields: [
                ["heroEyebrow", "النص الصغير فوق العنوان"],
                ["heroTitle", "العنوان الرئيسي"],
                ["heroText", "النص الترحيبي"],
                ["heroButton", "زر الانتقال للمنتجات"],
                ["heroNote", "الملاحظة أسفل الزر"],
                ["heroImageAlt", "وصف صورة الغلاف"],
                ["photoCaption", "النص فوق صورة الغلاف"],
                ["heroSeal", "النص داخل الدائرة"],
              ],
            },
            {
              title: "الشريط والمنتجات",
              fields: [
                ["ribbon1", "نص الشريط الأول"],
                ["ribbon2", "نص الشريط الثاني"],
                ["ribbon3", "نص الشريط الثالث"],
                ["catalogEyebrow", "النص الصغير لقسم المنتجات"],
                ["catalogTitle", "عنوان قسم المنتجات"],
                ["subtitle", "وصف قسم المنتجات"],
                ["searchPlaceholder", "نص حقل البحث"],
                ["productAction", "زر المنتج"],
                ["emptySearch", "رسالة البحث الفارغ"],
                ["emptyCatalog", "رسالة عدم وجود منتجات"],
              ],
            },
            {
              title: "التواصل والتذييل",
              fields: [
                ["contactEyebrow", "النص الصغير لقسم التواصل"],
                ["contactTitle", "عنوان قسم التواصل"],
                ["contactText", "وصف قسم التواصل"],
                ["contactButton", "زر التواصل"],
                ["adminLink", "رابط لوحة التحكم أسفل الصفحة"],
                ["whatsappNumber", "رقم واتساب مع رمز الدولة"],
                ["footer", "اسم الدومين أسفل الموقع"],
              ],
            },
          ].map((section) => (
            <section className="settings-group" key={section.title}>
              <h3>{section.title}</h3>
              {section.fields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    required
                    maxLength={500}
                    dir={
                      key === "whatsappNumber" || key === "footer"
                        ? "ltr"
                        : undefined
                    }
                    value={settings[key] || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </section>
          ))}
          <section className="settings-group">
            <h3>صورة الغلاف</h3>
            <label>
              رفع صورة غلاف جديدة
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading || busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5000000) {
                    setError("الصورة يجب أن تكون أقل من 5 ميغابايت.");
                    return;
                  }
                  setUploading(true);
                  setError("");
                  try {
                    const fd = new FormData();
                    fd.append("image", file);
                    const result = await api("upload", {
                      method: "POST",
                      body: fd,
                    });
                    setSettings({ ...settings, heroImage: result.url });
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <small>JPG، PNG، WEBP · حتى 5 ميغابايت</small>
            </label>
            <label>
              أو رابط صورة HTTPS
              <input
                required
                dir="ltr"
                maxLength={2000}
                value={settings.heroImage || ""}
                onChange={(e) =>
                  setSettings({ ...settings, heroImage: e.target.value })
                }
              />
            </label>
            {settings.heroImage && (
              <img
                className="image-preview hero-preview"
                src={settings.heroImage}
                alt="معاينة صورة الغلاف"
              />
            )}
          </section>
          <button className="primary" disabled={busy}>
            حفظ معلومات الموقع
          </button>
        </form>
      )}
      {tab === "security" && (
        <form
          className="panel settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (fd.get("password") !== fd.get("confirm")) {
              setError("كلمتا المرور غير متطابقتين.");
              return;
            }
            task(async () => {
              await api("password", {
                method: "PUT",
                body: JSON.stringify({
                  currentPassword: fd.get("currentPassword"),
                  password: fd.get("password"),
                }),
              });
              setAuthenticated(false);
              setMessage("تم تغيير كلمة المرور. سجّل الدخول من جديد.");
            });
          }}
        >
          <h2>تغيير كلمة المرور</h2>
          <label>
            كلمة المرور الحالية
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            كلمة المرور الجديدة
            <input
              type="password"
              name="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <label>
            تأكيد كلمة المرور الجديدة
            <input
              type="password"
              name="confirm"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            تحديث كلمة المرور
          </button>
        </form>
      )}
    </main>
  );
}
