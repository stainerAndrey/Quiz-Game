import { useEffect, useState } from "react";
import { API_BASE, makeWsUrl } from "../api.js";
import { theme } from "../theme.js";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import Card from "./ui/Card.jsx";
import { Skeleton } from "./ui/Skeleton.jsx";

export default function ParticipantApp() {
  const [participantId, setParticipantId] = useState(() => localStorage.getItem("participant_id") || "");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [state, setState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [imageError, setImageError] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!participantId) { setValidated(true); return; }
      try {
        const res = await fetch(`${API_BASE}/participant/${participantId}`);
        if (!res.ok) {
          localStorage.removeItem("participant_id");
          setParticipantId("");
          setName("");
        } else {
          // Retrieve participant name from backend
          const data = await res.json();
          if (data.name) {
            setName(data.name);
          }
        }
      } catch {
        // On error, clear participant_id
        localStorage.removeItem("participant_id");
        setParticipantId("");
        setName("");
      } finally {
        setValidated(true);
      }
    };
    validate();
  }, [participantId]);

  useEffect(() => {
    if (!participantId) return;
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
  }, [participantId]);

  useEffect(() => {
    const checkExistingAnswer = async () => {
      if (!state?.question || !participantId) { setSelectedOption(null); return; }
      try {
        const res = await fetch(`${API_BASE}/answer_status/${participantId}/${state.question.id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedOption(data.answered ? data.option_index : null);
        }
      } catch { setSelectedOption(null); }
    };
    checkExistingAnswer();
  }, [state?.question?.id, participantId]);

  const join = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          // Duplicate name
          setJoinError(data.detail || "This name is already taken. Please choose a different name.");
        } else {
          setJoinError(data.detail || "Failed to join. Please try again.");
        }
        setJoining(false);
        return;
      }

      const data = await res.json();
      setJoining(false);
      localStorage.setItem("participant_id", data.participant_id);
      setParticipantId(data.participant_id);
    } catch (error) {
      setJoining(false);
      setJoinError("Network error. Please check your connection and try again.");
    }
  };

  const remainingSeconds = state?.remaining_seconds ?? null;

  const submitAnswer = async (idx) => {
    if (!state?.question || !participantId) return;
    if (selectedOption !== null) return;
    if (remainingSeconds !== null && remainingSeconds <= 0) return;
    setSelectedOption(idx);
    const res = await fetch(`${API_BASE}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_id: participantId, question_id: state.question.id, option_index: idx }) });
    const data = await res.json();
    if (data.status === 'error') {
      setSelectedOption(null);
    }
  };

  if (!validated) {
    return (
      <div style={{ padding: theme.spacing.xl, maxWidth: '640px', margin: '0 auto' }}>
        <Skeleton height="2rem" width="60%" />
        <Skeleton height="1rem" width="40%" style={{ marginTop: theme.spacing.md }} />
      </div>
    );
  }

  if (!participantId) {
    return (
      <div style={{ maxWidth: '480px', margin: '2rem auto', padding: theme.spacing.xl }}>
        <Card variant="gradient" padding="xl">
          <h1 style={{ marginTop: 0, textAlign: 'center' }}>Join the Quiz</h1>
          <p style={{ textAlign: 'center', color: theme.colors.neutral[600], marginBottom: theme.spacing.xl }}>
            Enter your name to participate
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
              value={name}
              onChange={e => {
                setName(e.target.value);
                setJoinError(""); // Clear error when user types
              }}
              placeholder="Your name"
              aria-label="Enter your name"
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
              disabled={joining || !name.trim()}
              loading={joining}
              size="lg"
              style={{ width: '100%' }}
            >
              {joining ? 'Joining...' : 'Join Quiz'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl, textAlign: 'center' }}>
        <Card variant="gradient" padding="xl">
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>⏳</div>
          <h2 style={{ marginTop: 0 }}>Waiting for quiz to start...</h2>
          <div style={{ marginTop: theme.spacing.lg }}>
            <Badge variant={wsStatus === 'connected' ? 'success' : 'danger'}>
              {wsStatus === 'connected' ? '🟢 Connected' : '🔴 Connecting...'}
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  if (state.state.is_finished) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl }}>
        <Card variant="gradient" padding="xl" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🎉</div>
          <h1 style={{ marginTop: 0 }}>Quiz Finished!</h1>
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
            Check the scoreboard on the big screen 🏆
          </p>
          <div style={{ marginTop: theme.spacing.lg, fontSize: theme.fontSizes.sm, color: theme.colors.neutral[500] }}>
            Thanks for playing, {name}!
          </div>
        </Card>
      </div>
    );
  }

  const q = state.question;
  const currentIndex = state.state.current_question_index;
  const totalQuestions = state.total_questions;

  if (!q) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: theme.spacing.xl, textAlign: 'center' }}>
        <Card variant="gradient" padding="xl">
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>📝</div>
          <h2>Waiting for the first question...</h2>
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
      <div style={{
        marginBottom: theme.spacing.lg,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Badge variant={wsStatus === 'connected' ? 'success' : 'danger'} size="sm">
            {wsStatus === 'connected' ? '🟢' : '🔴'}
          </Badge>
          <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.neutral[600] }}>
            You: <strong>{name || '(anonymous)'}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Badge variant="default">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
          {remainingSeconds !== null && (
            <Badge variant={getTimerVariant()}>
              {remainingSeconds > 0 ? `⏱ ${remainingSeconds}s` : '⏱ Time up'}
            </Badge>
          )}
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        {q.image_url && !imageError && (
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            <img
              src={q.image_url}
              alt='Question illustration'
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
            📷 Image unavailable
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
                  aria-label={`Option ${idx + 1}: ${opt}`}
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
            ✅ Answer locked: {q.options[selectedOption]}
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
            ⏱ Time expired for this question
          </div>
        )}
      </Card>
    </div>
  );
}

