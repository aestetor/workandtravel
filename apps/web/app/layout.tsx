import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work & Travel Platform",
  description: "Площадка для хостов и путешественников"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
