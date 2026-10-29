import { env } from "cloudflare:workers";
import { demoDeadline, demoImage, demoProducts } from "./demo-products";
export const bindings = () =>
  env as unknown as { DB: D1Database; BUCKET: R2Bucket; SETUP_TOKEN?: string };
export const database = () => bindings().DB;
export const defaults = {
  title: "הזדמנות אחרונה",
  brandLatin: "HAZDMANUT AHARONA",
  navLabel: "הקולקציה שלנו ↙",
  contactLinkLabel: "דברו איתנו ↗",
  subtitle: "פריטים נבחרים. הזדמנויות ששווה לגלות.",
  heroEyebrow: "נבחר בקפידה. בשבילכם.",
  heroTitle: "דברים טובים,\nבזמן הנכון.",
  heroText:
    "מבחר מדויק לבית וליום־יום. מצאתם משהו שאהבתם? דברו איתנו בוואטסאפ.",
  heroButton: "לגלות את הפריטים ↙",
  heroNote: "בחירות קטנות. הבדל גדול.",
  heroImage:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
  heroImageAlt: "חלל ביתי מעוצב וחמים",
  photoCaption: "מקום לדברים\nשאוהבים.",
  heroSeal: "נבחרו\nבשבילכם ✳",
  ribbon1: "עיצוב עם אופי",
  ribbon2: "פריטים ליום יום",
  ribbon3: "שירות אישי בוואטסאפ",
  catalogEyebrow: "הבחירות שלנו",
  catalogTitle: "אולי זה בדיוק מה שחיפשתם.",
  searchPlaceholder: "מה מחפשים היום?",
  productAction: "לפרטים בוואטסאפ ↗",
  emptySearch: "לא נמצאו פריטים שמתאימים לחיפוש.",
  emptyCatalog: "הקולקציה החדשה בדרך. לפרטים, אנחנו בוואטסאפ.",
  contactEyebrow: "בואו נדבר",
  contactTitle: "מצאתם משהו שאהבתם?",
  contactText: "לחיצה על פריט פותחת הודעה בוואטסאפ עם שמו ומחירו.",
  contactButton: "אנחנו כאן בשבילכם ↗",
  adminLink: "ניהול האתר",
  whatsappNumber: "972594640044",
  notice: "בוחרים באתר · שואלים בוואטסאפ",
  footer: "hazdmanut-aharona.co.il",
};
export async function getSettings() {
  const rows = await database()
    .prepare("SELECT key,value FROM settings")
    .all<{ key: string; value: string }>();
  return {
    ...defaults,
    ...Object.fromEntries(rows.results.map((r) => [r.key, r.value])),
  };
}
export async function listProducts(admin = false) {
  const rows = await database()
    .prepare(
      `SELECT * FROM products ${admin ? "" : "WHERE active=1"} ORDER BY sort,updated DESC`,
    )
    .all<Record<string, any>>();
  const products = rows.results.map((p) => ({
    ...p,
    originalPrice: p.original_price,
    dealEnd: p.deal_end,
    featured: Boolean(p.featured),
    active: Boolean(p.active),
  }));
  const legacyDemo = products.length > 0 && products.every((p) => String((p as any).name).includes("· דוגמה"));
  if (admin || (products.length && !legacyDemo)) return products;
  const deadline = demoDeadline();
  return demoProducts.map((p, index) => ({
    ...p,
    id: `demo-${index + 1}`,
    image: demoImage(p.image),
    active: true,
    sort: index,
    dealEnd: p.featured ? deadline : null,
  }));
}
