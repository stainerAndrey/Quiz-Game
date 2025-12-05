import { useEffect, useMemo, useState } from "react";
import { API_BASE, makeWsUrl } from "../api.js";
import { theme } from "../theme.js";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import Card from "./ui/Card.jsx";
import { useI18n, localizeQuestion } from "../i18n.jsx";
import LanguageSelector from "./ui/LanguageSelector.jsx";

const USERNAME_STORAGE_KEY = "quiz_username";

export default function ParticipantApp() {
  const { language, t } = useI18n();
  const [username, setUsername] = useState("");
  const [restoringSession, setRestoringSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [state, setState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [imageError, setImageError] = useState(false);
  const [localTimer, setLocalTimer] = useState(null);
  const revealMode = Boolean(state?.state?.reveal_answer);
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
    let cancelled = false;
    if (typeof window === "undefined") {
      setRestoringSession(false);
      return;
    }
    const storedName = window.localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedName) {
      setUsername(storedName);
    }
    if (!storedName) {
      setRestoringSession(false);
      return;
    }
    const attemptResume = async () => {
      try {
        const res = await fetch(`${API_BASE}/participant/${encodeURIComponent(storedName)}`);
        if (!res.ok) {
          if (res.status === 404 && typeof window !== "undefined") {
            window.localStorage.removeItem(USERNAME_STORAGE_KEY);
            if (!cancelled) setUsername("");
          }
          return;
        }
        if (cancelled) return;
        setIsLoggedIn(true);
      } catch {
        // ignore network failures; show login form
      } finally {
        if (!cancelled) setRestoringSession(false);
      }
    };
    attemptResume();
    return () => {
      cancelled = true;
    };
  }, []);

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
    let cancelled = false;
    const controller = new AbortController();
    const checkExistingAnswer = async () => {
      if (!state?.question || !username || !isLoggedIn) {
        setSelectedOption(null);
        return;
      }
      setSelectedOption(null);
      try {
        const res = await fetch(
          `${API_BASE}/answer_status/${encodeURIComponent(username)}/${state.question.id}`,
          { signal: controller.signal }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.answered) {
          setSelectedOption(data.option_index);
        }
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    };
    checkExistingAnswer();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [state?.question?.id, username, isLoggedIn]);

  useEffect(() => {
    if (!state?.question || revealMode) {
      setLocalTimer(null);
      return;
    }
    if (typeof state?.remaining_seconds === "number") {
      setLocalTimer(state.remaining_seconds);
    } else {
      setLocalTimer(null);
    }
  }, [state?.question?.id, state?.remaining_seconds, state?.state?.current_question_index, revealMode]);

  useEffect(() => {
    if (revealMode) return;
    const id = setInterval(() => {
      setLocalTimer(prev => {
        if (prev === null) return null;
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [revealMode]);

  const join = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setJoining(true);
    setJoinError("");
    const trimmedName = username.trim();

    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
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

      const data = await res.json().catch(() => ({}));
      const canonical = data.username || trimmedName;
      setUsername(canonical);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USERNAME_STORAGE_KEY, canonical);
      }
      setJoining(false);
      setIsLoggedIn(true);
    } catch {
      setJoining(false);
      setJoinError(t("join_error_network"));
    }
  };

  const remainingSeconds = revealMode ? null : localTimer;

  const submitAnswer = async (idx) => {
  if (!state?.question || !username || !isLoggedIn) return;
  if (selectedOption !== null) return;
  if (revealMode) return;
  if (remainingSeconds !== null && remainingSeconds <= 0) return;
  setSelectedOption(idx);
  const res = await fetch(`${API_BASE}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_id: username, question_id: state.question.id, option_index: idx }) });
  const data = await res.json();
  if (data.status === 'error') {
    setSelectedOption(null);
  }
  };

  if (restoringSession && !isLoggedIn) {
    return (
      <div style={{ maxWidth: '480px', margin: '2rem auto', padding: theme.spacing.xl }}>
        {languageSelector}
        <Card variant="gradient" padding="xl" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>🔄</div>
          <h2 style={{ marginTop: 0 }}>{t("waiting_start_title")}</h2>
          <p style={{ color: theme.colors.neutral[600] }}>Rejoining your previous session...</p>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '480px', margin: '2rem auto', padding: theme.spacing.md }}>
        {languageSelector}
        <Card variant="gradient" padding="xl">
          <h1 style={{ marginTop: 0, wordBreak: "break-word", fontSize: "clamp(1.5rem, 4vw, 3rem)", textAlign: 'center' }}>{t("join_title")}</h1>
          <p style={{ textAlign: 'center', wordBreak: "break-word", fontSize: "clamp(1rem, 4vw, 1.5rem)", color: theme.colors.neutral[600], marginBottom: theme.spacing.xl }}>
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
                width: '90%',
                borderRadius: theme.radii.lg,
                border: `2px solid ${joinError ? theme.colors.danger[500] : theme.colors.neutral[300]}`,
                margin: `${theme.spacing.lg} auto`,
                display: "block",
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
              style={{ width: '100%', height: '48px' }}
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
  const displayImage = (revealMode && q?.reveal_image_url) ? q.reveal_image_url : q?.image_url;
  const imageAlt = revealMode ? t("reveal_image_alt") : t("question_image_alt");
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
          {revealMode ? (
            <Badge variant="success">
              ✨ {t("answer_revealed_badge")}
            </Badge>
          ) : remainingSeconds !== null ? (
            <Badge variant={getTimerVariant()}>
              {remainingSeconds > 0
                ? t("timer_running", { seconds: remainingSeconds })
                : t("timer_up")}
            </Badge>
          ) : null}
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        {displayImage && !imageError && (
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            <img
              src={displayImage}
              alt={imageAlt}
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
        {displayImage && imageError && (
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
            fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
            lineHeight: 1.35,
            wordBreak: "break-word",
            hyphens: "auto",
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
            const isCorrect = revealMode && q.correct_index === idx;
            const isDisabled = revealMode || selectedOption !== null || (remainingSeconds !== null && remainingSeconds <= 0);

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
                    border: isCorrect
                      ? `3px solid ${theme.colors.success[500]}`
                      : isSelected
                        ? `3px solid ${theme.colors.primary[600]}`
                        : `2px solid ${theme.colors.neutral[300]}`,
                    background: isCorrect
                      ? `linear-gradient(135deg, ${theme.colors.success[50]}, ${theme.colors.success[100]})`
                      : isSelected
                        ? `linear-gradient(135deg, ${theme.colors.primary[100]}, ${theme.colors.primary[200]})`
                        : `linear-gradient(135deg, #ffffff, ${theme.colors.neutral[50]})`,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isSelected ? theme.shadows.lg : theme.shadows.sm,
                    color: isCorrect ? theme.colors.success[700] : theme.colors.neutral[900],
                    fontWeight: isCorrect || isSelected ? theme.fontWeights.semibold : theme.fontWeights.normal,
                    opacity: revealMode
                      ? (isCorrect ? 1 : 0.6)
                      : selectedOption !== null && !isSelected
                        ? 0.6
                        : (remainingSeconds !== null && remainingSeconds <= 0 ? 0.5 : 1),
                    transition: `all ${theme.transitions.base}`,
                    transform: isCorrect || isSelected ? 'scale(1.01)' : 'scale(1)',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    minHeight: '44px',
                    whiteSpace: 'normal',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{ marginRight: theme.spacing.sm, fontWeight: theme.fontWeights.bold }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt} {isCorrect ? "✅" : ""}
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

        {revealMode && q.correct_index !== null && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              borderRadius: theme.radii.lg,
              background: theme.colors.neutral[50],
              border: `2px solid ${theme.colors.success[200]}`,
              color: theme.colors.neutral[800],
              fontWeight: theme.fontWeights.semibold,
              textAlign: 'center',
            }}
          >
            ✨ {t("correct_answer_label", { answer: q.options[q.correct_index] })}
          </div>
        )}

        {revealMode && selectedOption === null && (
          <div
            role="alert"
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              borderRadius: theme.radii.lg,
              background: theme.colors.neutral[50],
              border: `2px solid ${theme.colors.neutral[300]}`,
              color: theme.colors.neutral[700],
              textAlign: 'center',
            }}
          >
            {t("answer_phase_closed")}
          </div>
        )}
      </Card>
    </div>
  );
}
