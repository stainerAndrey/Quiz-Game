import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "quiz_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

const MESSAGES = {
  en: {
    language_label: "Language",
    join_title: "Join the Quiz",
    join_subtitle: "Enter your username to participate",
    username_placeholder: "Your username",
    join_button: "Join Quiz",
    joining_button: "Joining...",
    join_error_taken: "This username is already in use. Please choose a different one.",
    join_error_generic: "Failed to join. Please try again.",
    join_error_network: "Network error. Please check your connection and try again.",
    waiting_start_title: "Waiting for quiz to start...",
    status_connected: "Connected",
    status_connecting: "Connecting...",
    quiz_finished_title: "Quiz Finished!",
    quiz_finished_cta: "Check the scoreboard on the big screen 🏆",
    quiz_finished_thanks: "Thanks for playing, {name}!",
    waiting_question_title: "Waiting for the first question...",
    you_label: "You:",
    anonymous_user: "(anonymous)",
    question_progress: "Question {current} of {total}",
    timer_running: "⏱ {seconds}s",
    timer_up: "⏱ Time up",
    question_image_alt: "Question illustration",
    image_unavailable: "📷 Image unavailable",
    answer_locked: "✅ Answer locked: {answer}",
    time_expired: "⏱ Time expired for this question",
    option_aria_label: "Option {index}: {text}",
  },
  ru: {
    language_label: "Язык",
    join_title: "Присоединяйтесь к викторине",
    join_subtitle: "Введите имя пользователя, чтобы участвовать",
    username_placeholder: "Ваше имя",
    join_button: "Войти",
    joining_button: "Входим...",
    join_error_taken: "Это имя уже занято. Пожалуйста, выберите другое.",
    join_error_generic: "Не удалось войти. Попробуйте снова.",
    join_error_network: "Ошибка сети. Проверьте соединение и повторите попытку.",
    waiting_start_title: "Ожидаем начала викторины...",
    status_connected: "Подключено",
    status_connecting: "Подключение...",
    quiz_finished_title: "Викторина окончена!",
    quiz_finished_cta: "Смотрите таблицу лидеров на большом экране 🏆",
    quiz_finished_thanks: "Спасибо за игру, {name}!",
    waiting_question_title: "Ждем первый вопрос...",
    you_label: "Вы:",
    anonymous_user: "(аноним)",
    question_progress: "Вопрос {current} из {total}",
    timer_running: "⏱ {seconds}с",
    timer_up: "⏱ Время вышло",
    question_image_alt: "Иллюстрация к вопросу",
    image_unavailable: "📷 Изображение недоступно",
    answer_locked: "✅ Ответ принят: {answer}",
    time_expired: "⏱ Время на этот вопрос истекло",
    option_aria_label: "Вариант {index}: {text}",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && MESSAGES[stored]) return stored;
  } catch {
    /* ignore */
  }
  const nav = typeof window !== "undefined" ? window.navigator?.language : null;
  const short = nav ? nav.slice(0, 2).toLowerCase() : null;
  if (short && MESSAGES[short]) return short;
  return "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const translate = useCallback(
    (key, vars) => {
      const template = (MESSAGES[language] && MESSAGES[language][key]) ?? MESSAGES.en[key] ?? key;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, token) =>
        Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : match
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translate,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, translate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

export function localizeQuestion(question, language) {
  if (!question) return null;
  const translation = question.translations?.[language];
  if (!translation) {
    return question;
  }
  const baseOptions = Array.isArray(question.options) ? question.options : [];
  const translatedOptions =
    Array.isArray(translation.options) && translation.options.length === baseOptions.length
      ? translation.options
      : translation.options || baseOptions;
  return {
    ...question,
    text: translation.text || question.text,
    options: translatedOptions,
    image_url: translation.image_url || question.image_url,
  };
}
