"use client";
import { useEffect, useState } from "react";
import { api, type Product } from "@/lib/client";
import { whatsappLink } from "@/lib/validation";
export default function Store() {
  const [data, setData] = useState<{
      products: Product[];
      settings: Record<string, string>;
    } | null>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("הכל");
  useEffect(() => {
    api("catalog")
      .then(setData)
      .catch(() => setError("לא ניתן לטעון את הפריטים. נסו לרענן את העמוד."));
  }, []);
  const s = data?.settings;
  const whatsappNumber = s?.whatsappNumber || "972594640044";
  const lines = (value: string) =>
    value.split("\n").map((line, index) => (
      <span key={`${line}-${index}`}>
        {line}
        {index < value.split("\n").length - 1 && <br />}
      </span>
    ));
  const products =
    data?.products.filter(
      (p) =>
        (category === "הכל" || p.category === category) &&
        p.name.toLowerCase().includes(query.toLowerCase()),
    ) || [];
  return (
    <>
      <div className="announcement">
        {s?.notice || "הזדמנות אחרונה · דברים טובים בזמן הנכון"}
      </div>
      <header className="site-header">
        <a className="brand" href="/">
          {s?.title || "הזדמנות אחרונה"}
          <span>{s?.brandLatin || "HAZDMANUT AHARONA"}</span>
        </a>
        <a className="nav-link" href="#collection">
          {s?.navLabel || "הקולקציה שלנו ↙"}
        </a>
        <a
          className="outline-link"
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {s?.contactLinkLabel || "דברו איתנו ↗"}
        </a>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              {s?.heroEyebrow || "נבחר בקפידה. בשבילכם."}
            </p>
            <h1>{s?.heroTitle || "דברים טובים,\nבזמן הנכון."}</h1>
            <p>
              {s?.heroText ||
                "מבחר מדויק לבית וליום־יום. מצאתם משהו שאהבתם? דברו איתנו בוואטסאפ."}
            </p>
            <a className="primary" href="#collection">
              {s?.heroButton || "לגלות את הפריטים ↙"}
            </a>
            <div className="small-note">
              {s?.heroNote || "בחירות קטנות. הבדל גדול."}
            </div>
          </div>
          <div className="hero-photo">
            <img
              src={
                s?.heroImage ||
                "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
              }
              alt={s?.heroImageAlt || "חלל ביתי מעוצב וחמים"}
            />
            <div className="photo-caption">
              {lines(s?.photoCaption || "מקום לדברים\nשאוהבים.")}
            </div>
            <div className="seal">
              {lines(s?.heroSeal || "נבחרו\nבשבילכם ✳")}
            </div>
          </div>
        </section>
        <div className="ribbon">
          <span>{s?.ribbon1 || "עיצוב עם אופי"}</span>
          <b>✳</b>
          <span>{s?.ribbon2 || "פריטים ליום יום"}</span>
          <b>✳</b>
          <span>{s?.ribbon3 || "שירות אישי בוואטסאפ"}</span>
        </div>
        <section className="catalog" id="collection">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{s?.catalogEyebrow || "הבחירות שלנו"}</p>
              <h2>{s?.catalogTitle || "אולי זה בדיוק מה שחיפשתם."}</h2>
            </div>
            <p>{s?.subtitle}</p>
          </div>
          <div className="catalog-tools">
            <div className="filters">
              {["הכל", ...new Set(data?.products.map((p) => p.category))].map(
                (c) => (
                  <button
                    key={c}
                    className={category === c ? "selected" : ""}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
            <label className="search">
              ⌕{" "}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={s?.searchPlaceholder || "מה מחפשים היום?"}
                aria-label="חיפוש מוצרים"
              />
            </label>
          </div>
          {error ? (
            <p role="alert">
              {error}{" "}
              <button onClick={() => location.reload()}>לנסות שוב</button>
            </p>
          ) : !data ? (
            <div className="loading" role="status">
              טוענים את הקולקציה…
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p, i) => (
                <a
                  className="product-card"
                  key={p.id}
                  href={whatsappLink(p, undefined, whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  aria-label={`${p.name}, ${p.price} שקלים. לפרטים בוואטסאפ`}
                >
                  <div className="product-image">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <span className="product-category">{p.category}</span>
                    <span className="product-action">
                      {s?.productAction || "לפרטים בוואטסאפ ↗"}
                    </span>
                  </div>
                  <div className="product-meta">
                    <h3>{p.name}</h3>
                    <span>
                      ₪
                      {Number(p.price).toLocaleString("he-IL", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
          {data && !products.length && (
            <div className="empty">
              {data.products.length
                ? s?.emptySearch || "לא נמצאו פריטים שמתאימים לחיפוש."
                : s?.emptyCatalog ||
                  "הקולקציה החדשה בדרך. לפרטים, אנחנו בוואטסאפ."}
            </div>
          )}
        </section>
        <section className="contact-strip">
          <div>
            <p className="eyebrow">{s?.contactEyebrow || "בואו נדבר"}</p>
            <h2>{s?.contactTitle || "מצאתם משהו שאהבתם?"}</h2>
            <p>
              {s?.contactText ||
                "לחיצה על פריט פותחת הודעה בוואטסאפ עם שמו ומחירו."}
            </p>
          </div>
          <a
            className="primary"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s?.contactButton || "אנחנו כאן בשבילכם ↗"}
          </a>
        </section>
      </main>
      <footer>
        <a className="brand" href="/">
          {s?.title || "הזדמנות אחרונה"}
        </a>
        <span dir="ltr">{s?.footer || "hazdmanut-aharona.co.il"}</span>
        <a href="/admin">{s?.adminLink || "ניהול האתר"}</a>
      </footer>
    </>
  );
}
