import Link from "next/link";

import { getMessages } from "../i18n";

const cards = (copy: ReturnType<typeof getMessages>) => [
  {
    title: copy.ctaFindHost,
    description: "Поиск по локации, навыкам и датам. Астана — первый регион запуска.",
    href: "/listings"
  },
  {
    title: copy.ctaBecomeHost,
    description: "Создайте объявление, укажите правила дома и доступность.",
    href: "/listings/new"
  },
  {
    title: copy.ctaMessages,
    description: "Общайтесь в тредах по заявкам, договаривайтесь о датах и задачах.",
    href: "/messages"
  }
];

export default function Home() {
  const copy = getMessages("ru");
  return (
    <main className="min-h-screen">
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <header className="mb-12">
          <p className="text-sm font-medium text-gray-600 uppercase">{copy.heroTagline}</p>
          <h1 className="text-4xl font-semibold mt-2">{copy.heroTitle}</h1>
          <p className="text-lg text-gray-700 mt-4 max-w-3xl">{copy.heroSubtitle}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {cards(copy).map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
