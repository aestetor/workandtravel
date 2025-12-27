import ru from "./messages/ru.json";

export type Locale = "ru" | "en";

const messages: Record<Locale, typeof ru> = {
  ru,
  en: ru
};

export const defaultLocale: Locale = "ru";

export function getMessages(locale: Locale = defaultLocale) {
  return messages[locale] ?? messages[defaultLocale];
}
