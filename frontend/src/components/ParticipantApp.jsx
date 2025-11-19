import { useEffect, useMemo, useState } from "react";
import { API_BASE, makeWsUrl } from "../api.js";
import { theme } from "../theme.js";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import Card from "./ui/Card.jsx";
import { useI18n, localizeQuestion } from "../i18n.jsx";
import LanguageSelector from "./ui/LanguageSelector.jsx";

export default function ParticipantApp() {
  const { language, t } = useI18n();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [state, setState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [imageError, setImageError] = useState(false);
  const localizedQuestion = useMemo(
    () => localizeQuestion(state?.question, language),
    [state?.question, language]
  );
  const languageSelector = (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: theme.spacing.md }}>
      <LanguageSelector />
    </div>
  );

  useEffect(() => {
    if (!isLoggedIn || !username) return;
    const ws = new WebSocket(makeWsUrl());
    ws.onopen = () => setWsStatus("connected");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setState(msg.payload);
        setImageError(false);
      }
    };
    ws.onclose = () => setWsStatus("disconnected");
    return () => ws.close();
  }, [isLoggedIn, username]);

  useEffect(() => {
    const checkExistingAnswer = async () => {
      if (!state?.question || !username || !isLoggedIn) { setSelectedOption(null); return; }
      try {
        const res = await fetch(`${API_BASE}/answer_status/${encodeURIComponent(username)}/${state.question.id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedOption(data.answered ? data.option_index : null);
        }
      } catch { setSelectedOption(null); }
    };
    checkExistingAnswer();
  }, [state?.question?.id, username, isLoggedIn]);

  const join = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username.trim() })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setJoinError(data.detail || t("join_error_taken"));
        } else {
          setJoinError(data.detail || t("join_error_generic"));
        }
        setJoining(false);
        return;
      }

      await res.json();
      setJoining(false);
      setIsLoggedIn(true);
    } catch {
      setJoining(false);
      setJoinError(t("join_error_network"));
    }
  };

  const remainingSeconds = state?.remaining_seconds ?? null;

  const submitAnswer = async (idx) => {
    if (!state?.question || !username || !isLoggedIn) return;
    if (selectedOption !== null) return;
    if (remainingSeconds !== null && remainingSeconds <= 0) return;
    setSelectedOption(idx);
    const res = await fetch(`${API_BASE}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_id: username, question_id: state.question.id, option_index: idx }) });
    const data = await res.json();
    if (data.status === 'error') {
      setSelectedOption(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '480px', margin: '2rem auto', padding: theme.spacing.xl }}>
        {languageSelector}
        <Card variant="gradient" padding="xl">
          <h1 style={{ marginTop: 0, textAlign: 'center' }}>{t("join_title")}</h1>
          <p style={{ textAlign: 'center', color: theme.colors.neutral[600], marginBottom: theme.spacing.xl }}>
            {t("join_subtitle")}
          </p>

          {joinError && (
            <div
              role="alert"
              style={{
                padding: theme.spacing.md,
                marginBottom: theme.spacing.lg,
                borderRadius: theme.radii.lg,
                background: theme.colors.danger[50],
                border: `2px solid ${theme.colors.danger[500]}`,
                color: theme.colors.danger[700],
                fontSize: theme.fontSizes.sm,
                textAlign: 'center',
              }}
            >
              ⚠️ {joinError}
            </div>
          )}

          <form onSubmit={join}>
            <input
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setJoinError(""); // Clear error when user types
              }}
              placeholder={t("username_placeholder")}
              aria-label={t("username_placeholder")}
              required
              autoFocus
              style={{
                padding: theme.spacing.md,
                fontSize: theme.fontSizes.lg,
                width: '100%',
                borderRadius: theme.radii.lg,
                border: `2px solid ${joinError ? theme.colors.danger[500] : theme.colors.neutral[300]}`,
                marginBottom: theme.spacing.lg,
                fontFamily: 'inherit',
                transition: `border-color ${theme.transitions.base}`,
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.primary[500]}
              onBlur={(e) => e.target.style.borderColor = joinError ? theme.colors.danger[500] : theme.colors.neutral[300]}
            />
            <Button
              type='submit'
              disabled={joining || !username.trim()}
              loading={joining}
              size="lg"
              style={{ width: '100%' }}
            >
              {joining ? t("joining_button") : t("join_button")}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl, textAlign: 'center' }}>
        {languageSelector}
        <Card variant="gradient" padding="xl">
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>⏳</div>
          <h2 style={{ marginTop: 0 }}>{t("waiting_start_title")}</h2>
          <div style={{ marginTop: theme.spacing.lg }}>
            <Badge variant={wsStatus === 'connected' ? 'success' : 'danger'}>
              {wsStatus === 'connected' ? `🟢 ${t("status_connected")}` : `🔴 ${t("status_connecting")}`}
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  if (state.state.is_finished) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl }}>
        {languageSelector}
        <Card variant="gradient" padding="xl" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🎉</div>
          <h1 style={{ marginTop: 0 }}>{t("quiz_finished_title")}</h1>
          {state.final_image_url && (
            <div style={{ margin: `${theme.spacing.xl} 0` }}>
              <img
                src={state.final_image_url}
                alt='Quiz end'
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: theme.radii.lg,
                  boxShadow: theme.shadows.lg,
                }}
              />
            </div>
          )}
          <p style={{ fontSize: theme.fontSizes.lg, color: theme.colors.neutral[700] }}>
            {t("quiz_finished_cta")}
          </p>
          <div style={{ marginTop: theme.spacing.lg, fontSize: theme.fontSizes.sm, color: theme.colors.neutral[500] }}>
            {t("quiz_finished_thanks", { name: username || t("anonymous_user") })}
          </div>
        </Card>
      </div>
    );
  }

  const q = localizedQuestion;
  const currentIndex = state.state.current_question_index;
  const totalQuestions = state.total_questions;

  if (!q) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl, textAlign: 'center' }}>
        {languageSelector}
        <Card variant="gradient" padding="xl">
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>📝</div>
          <h2>{t("waiting_question_title")}</h2>
        </Card>
      </div>
    );
  }

  const getTimerVariant = () => {
    if (remainingSeconds === null) return 'info';
    if (remainingSeconds <= 0) return 'danger';
    if (remainingSeconds <= 5) return 'danger';
    if (remainingSeconds <= 15) return 'warning';
    return 'info';
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
      {languageSelector}
      <div style={{
        marginBottom: theme.spacing.lg,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Badge
            variant={wsStatus === 'connected' ? 'success' : 'danger'}
            size="sm"
            title={wsStatus === 'connected' ? t("status_connected") : t("status_connecting")}
          >
            {wsStatus === 'connected' ? '🟢' : '🔴'}
          </Badge>
          <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.neutral[600] }}>
            {t("you_label")} <strong>{username || t("anonymous_user")}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Badge variant="default">
            {t("question_progress", { current: currentIndex + 1, total: totalQuestions })}
          </Badge>
          {remainingSeconds !== null && (
            <Badge variant={getTimerVariant()}>
              {remainingSeconds > 0
                ? t("timer_running", { seconds: remainingSeconds })
                : t("timer_up")}
            </Badge>
          )}
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        {q.image_url && !imageError && (
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            <img
              src={q.image_url}
              alt={t("question_image_alt")}
              style={{
                maxWidth: '100%',
                maxHeight: 240,
                objectFit: 'cover',
                borderRadius: theme.radii.lg,
                boxShadow: theme.shadows.md,
              }}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {q.image_url && imageError && (
          <div style={{
            color: theme.colors.neutral[400],
            fontStyle: 'italic',
            marginBottom: theme.spacing.md,
            textAlign: 'center',
            padding: theme.spacing.lg,
            background: theme.colors.neutral[50],
            borderRadius: theme.radii.md,
          }}>
            {t("image_unavailable")}
          </div>
        )}

        <h2
          id="question-text"
          style={{
            marginTop: 0,
            marginBottom: theme.spacing.lg,
            color: theme.colors.neutral[900],
          }}
        >
          {q.text}
        </h2>

        <ul
          role="group"
          aria-labelledby="question-text"
          style={{ listStyle: 'none', padding: 0, margin: `${theme.spacing.lg} 0 0` }}
        >
          {q.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isDisabled = selectedOption !== null || (remainingSeconds !== null && remainingSeconds <= 0);

            return (
              <li key={idx} style={{ margin: `${theme.spacing.md} 0` }}>
                <button
                  onClick={() => submitAnswer(idx)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  aria-label={t("option_aria_label", { index: idx + 1, text: opt })}
                  style={{
                    width: '100%',
                    padding: theme.spacing.lg,
                    fontSize: theme.fontSizes.lg,
                    borderRadius: theme.radii.lg,
                    border: isSelected ? `3px solid ${theme.colors.primary[600]}` : `2px solid ${theme.colors.neutral[300]}`,
                    background: isSelected
                      ? `linear-gradient(135deg, ${theme.colors.primary[100]}, ${theme.colors.primary[200]})`
                      : `linear-gradient(135deg, #ffffff, ${theme.colors.neutral[50]})`,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isSelected ? theme.shadows.lg : theme.shadows.sm,
                    color: theme.colors.neutral[900],
                    fontWeight: isSelected ? theme.fontWeights.semibold : theme.fontWeights.normal,
                    opacity: selectedOption !== null && !isSelected ? 0.6 : (remainingSeconds !== null && remainingSeconds <= 0 ? 0.5 : 1),
                    transition: `all ${theme.transitions.base}`,
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    minHeight: '44px',
                  }}
                >
                  <span style={{ marginRight: theme.spacing.sm, fontWeight: theme.fontWeights.bold }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {selectedOption !== null && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              borderRadius: theme.radii.lg,
              background: theme.colors.success[50],
              border: `2px solid ${theme.colors.success[500]}`,
              color: theme.colors.success[700],
              fontWeight: theme.fontWeights.semibold,
              textAlign: 'center',
            }}
          >
            {t("answer_locked", { answer: q.options[selectedOption] })}
          </div>
        )}

        {remainingSeconds !== null && remainingSeconds <= 0 && selectedOption === null && (
          <div
            role="alert"
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              borderRadius: theme.radii.lg,
              background: theme.colors.danger[50],
              border: `2px solid ${theme.colors.danger[500]}`,
              color: theme.colors.danger[700],
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            {t("time_expired")}
          </div>
        )}
      </Card>
    </div>
  );
}
