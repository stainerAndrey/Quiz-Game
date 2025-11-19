import { useI18n, SUPPORTED_LANGUAGES } from "../../i18n.jsx";
import { theme } from "../../theme.js";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.neutral[600],
      }}
    >
      <span>{t("language_label")}:</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          borderRadius: theme.radii.md,
          border: `1px solid ${theme.colors.neutral[300]}`,
          background: "#fff",
          fontSize: theme.fontSizes.sm,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
