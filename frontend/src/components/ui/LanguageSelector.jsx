import { useI18n, SUPPORTED_LANGUAGES } from "../../i18n.jsx";
import { theme } from "../../theme.js";

const FLAG_BY_CODE = {
  en: "🇬🇧",
  ru: "🇷🇺",
};

export default function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  const nextLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code !== language) || SUPPORTED_LANGUAGES[0];
  const flag = FLAG_BY_CODE[nextLanguage.code] || "🌐";
  const label = `Switch to ${nextLanguage.label}`;

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage.code)}
      aria-label={label}
      title={label}
      style={{
        border: "none",
        background: theme.colors.neutral[50],
        borderRadius: "1rem",
        padding: theme.spacing.sm,
        minWidth: "3rem",
        minHeight: "3rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.35rem",
        boxShadow: theme.shadows.md,
        cursor: "pointer",
        transition: `transform ${theme.transitions.base}, box-shadow ${theme.transitions.base}`,
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.85)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      <span>{flag}</span>
    </button>
  );
}
