import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "הזדמנות אחרונה | Hazmanut Aharona",
  description: "פריטים נבחרים לבית וליום יום. לפרטים והזמנות בוואטסאפ.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
