export type DemoProduct = {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  description: string;
  badge: string;
  featured?: boolean;
};

// محتوى تجريبي واضح، يظهر تلقائياً عندما تكون قاعدة المنتجات فارغة.
export const demoProducts: DemoProduct[] = [
  { name: "מכונת קפה Barista Pro", price: 649, originalPrice: 999, image: "photo-1517668808822-9ebb02f2a0e6", category: "חשמל לבית", description: "קפה עשיר בלחיצה אחת, עם מקציף חלב ומראה יוקרתי למטבח.", badge: "דיל היום", featured: true },
  { name: "שואב אבק אלחוטי Flex", price: 499, originalPrice: 749, image: "photo-1558317374-067fb5f30001", category: "חשמל לבית", description: "קל, עוצמתי ונוח לפינות הקטנות. עד 45 דקות עבודה.", badge: "33% הנחה" },
  { name: "אוזניות Quiet Sound", price: 219, originalPrice: 349, image: "photo-1546435770-a3e426bf472b", category: "אלקטרוניקה", description: "צליל נקי, חיבור אלחוטי וכריות רכות לשעות של האזנה.", badge: "מחיר מיוחד" },
  { name: "שעון חכם Active", price: 179, originalPrice: 299, image: "photo-1523275335684-37898b6baf30", category: "אלקטרוניקה", description: "מעקב פעילות, התראות ומדדי בריאות במסך חד ונוח.", badge: "40% הנחה" },
  { name: "תיק גב Urban", price: 119, originalPrice: 189, image: "photo-1553062407-98eeb64c6a62", category: "ליום יום", description: "תאים מסודרים, מקום למחשב ועיצוב נקי שמתאים לכל יום.", badge: "נמכר מהר" },
  { name: "מנורת שולחן Nordic", price: 89, originalPrice: 149, image: "photo-1507473885765-e6ed057f782c", category: "לבית", description: "אור חמים ועיצוב מינימליסטי לפינת עבודה או קריאה.", badge: "40% הנחה" },
  { name: "סט כלי מטבח Stone", price: 269, originalPrice: 399, image: "photo-1584990347449-ae1f50b70baa", category: "למטבח", description: "סט שימושי לבישול יום־יומי עם ציפוי קל לניקוי.", badge: "חיסכון ₪130" },
  { name: "כורסה Lounge", price: 549, originalPrice: 799, image: "photo-1598300042247-d088f8ab3a91", category: "לבית", description: "ישיבה עמוקה, בד נעים וקווים נקיים לפינה האהובה בבית.", badge: "31% הנחה" },
  { name: "נעלי סניקרס Street", price: 159, originalPrice: 249, image: "photo-1549298916-b41d501d3772", category: "אופנה", description: "נוחות לכל היום עם סוליה קלה ומראה שמתאים לכל שילוב.", badge: "הזדמנות אחרונה" },
  { name: "משקפי שמש Classic", price: 79, originalPrice: 129, image: "photo-1511499767150-a48a237f0083", category: "אופנה", description: "מסגרת קלאסית, עדשות כהות ונרתיק נשיאה כלול.", badge: "39% הנחה" },
  { name: "רמקול Bluetooth Mini", price: 99, originalPrice: 169, image: "photo-1608043152269-423dbba4e7e1", category: "אלקטרוניקה", description: "צליל מפתיע בגודל קומפקטי, עם סוללה ליום שלם.", badge: "מחיר השקה" },
  { name: "סט נרות Aroma", price: 69, originalPrice: 109, image: "photo-1603006905003-be475563bc59", category: "לבית", description: "שלושה ניחוחות רגועים באווירה חמימה, באריזה מוכנה למתנה.", badge: "קונים וחוסכים" },
];

export const demoImage = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

export function demoDeadline() {
  const deadline = new Date();
  deadline.setUTCHours(23, 59, 59, 999);
  deadline.setUTCDate(deadline.getUTCDate() + 2);
  return deadline.getTime();
}
