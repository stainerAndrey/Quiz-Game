import { useEffect, useMemo, useState, useRef } from "react";
import { API_BASE, makeWsUrl } from "../api.js";
import QRCode from "react-qr-code";
import Scoreboard from "./Scoreboard.jsx";
import { theme } from "../theme.js";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import Card from "./ui/Card.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import AnswerChart from "./ui/AnswerChart.jsx";
import { useMediaQuery } from "../hooks/useMediaQuery.js";

export default function PresenterApp() {
  const [state, setState] = useState(null);
  const [results, setResults] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [participants, setParticipants] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [showTokenPrompt, setShowTokenPrompt] = useState(false);
  const [toast, setToast] = useState(null);
  const warnPlayedRef = useRef(false);
  const revealSound = useRef(null);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    revealSound.current = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const participantUrl = useMemo(() => {
    if (API_BASE && API_BASE !== "http://localhost:8000") {
      try { const apiUrl = new URL(API_BASE); return `http://${apiUrl.hostname}:5173/`; } catch {}
    }
    return window.location.origin + "/";
  }, []);

  useEffect(() => {
    const ws = new WebSocket(makeWsUrl());
    ws.onopen = () => setWsStatus("connected");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setState(msg.payload);
        fetchResults();
        fetchParticipants();
      }
    };
    ws.onclose = () => setWsStatus("disconnected");
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!state) return;
    const hasStarted = state.state.current_question_index >= 0 && !state.state.is_finished;
    if (!hasStarted) return;
    const id = setInterval(fetchParticipants, 2000);
    return () => clearInterval(id);
  }, [state]);

  const authHeaders = () => adminToken ? { 'X-Admin-Token': adminToken } : {};

  const callAdmin = async (endpoint) => {
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/admin/${endpoint}`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === 'error') {
        const msg = data.message || data.detail || 'Error';
        setErrorMsg(msg); setToast(msg);
      } else if (endpoint === 'reveal') {
        revealSound.current?.play().catch(() => {});
        setToast('Answer revealed ✨');
      } else if (endpoint === 'start') {
        setToast('Quiz started! 🚀');
      } else if (endpoint === 'next') {
        setToast('Next question');
      }
    } catch { setErrorMsg('Network error'); setToast('Network error ⚠️'); }
  };

  const extendTimer = async () => {
    const res = await fetch(`${API_BASE}/admin/extend?extra_seconds=10`, { method: 'POST', headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === 'error') setToast(data.message || 'Extend failed'); else setToast('+10s added ⏱️');
  };

  const saveToken = () => {
    localStorage.setItem('admin_token', adminToken.trim());
    setShowTokenPrompt(false);
    setToast('Admin token saved 🔐');
  };

  const resetQuiz = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to RESET the entire quiz?\n\n" +
      "This will:\n" +
      "• Remove all participants\n" +
      "• Clear all answers\n" +
      "• Reset quiz to beginning\n\n" +
      "This action CANNOT be undone!"
    );

    if (!confirmed) return;

    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.status === 'error') {
        const msg = data.message || data.detail || 'Reset failed';
        setErrorMsg(msg);
        setToast('❌ ' + msg);
      } else {
        setToast('✅ Quiz has been reset successfully');
        // Optionally clear localStorage for participants who might still have IDs
      }
    } catch {
      setErrorMsg('Network error during reset');
      setToast('⚠️ Network error during reset');
    }
  };

  const fetchResults = async () => {
    const res = await fetch(`${API_BASE}/admin/results`, { headers: authHeaders() });
    const data = await res.json().catch(() => null);
    if (data) setResults(data);
  };

  const fetchParticipants = async () => {
    const res = await fetch(`${API_BASE}/admin/participants`, { headers: authHeaders() });
    if (res.ok) { const data = await res.json(); setParticipants(data.participants || []); }
  };

  const q = state?.question || null;
  const isFinished = state?.state?.is_finished;
  const currentIndex = state?.state?.current_question_index ?? -1;
  const quizStarted = currentIndex >= 0;
  const totalQuestions = state?.total_questions ?? 0;
  const remainingSeconds = state?.remaining_seconds ?? null;

  useEffect(() => { warnPlayedRef.current = false; }, [state?.state?.current_question_index]);
  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds <= 5 && remainingSeconds > 0 && !warnPlayedRef.current) {
      warnPlayedRef.current = true;
      try {
        const ctx = new (window.AudioContext||window.webkitAudioContext)();
        const o=ctx.createOscillator();
        o.type='sine';
        o.frequency.value=880;
        o.connect(ctx.destination);
        o.start();
        setTimeout(()=>o.stop(),180);
      } catch {}
    }
  }, [remainingSeconds]);

  const currentAgg = q && results ? results.per_question.find(r => r.question_id === q.id) || null : null;

  const getTimerVariant = () => {
    if (remainingSeconds === null) return 'info';
    if (remainingSeconds <= 5) return 'danger';
    if (remainingSeconds <= 15) return 'warning';
    return 'info';
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            background: theme.colors.neutral[700],
            color: '#fff',
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.radii.lg,
            boxShadow: theme.shadows.xl,
            animation: 'slideInRight 200ms ease-out, fadeOut 200ms ease-in 2800ms',
            zIndex: 1000,
            maxWidth: '300px',
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        flexWrap: 'wrap',
        gap: theme.spacing.md,
      }}>
        <h1 style={{ margin: 0, flex: '1 1 auto' }}>
          Quiz Presenter
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Badge variant={wsStatus === 'connected' ? 'success' : 'danger'}>
            {wsStatus === 'connected' ? '🟢 Live' : '🔴 Connecting...'}
          </Badge>
          <Button
            onClick={resetQuiz}
            size="sm"
            variant="danger"
            aria-label="Reset quiz game"
            title="Reset entire quiz (clears all participants and answers)"
          >
            🔄 Reset
          </Button>
          <Button
            onClick={() => setShowTokenPrompt(s=>!s)}
            size="sm"
            variant="ghost"
            aria-label="Admin authentication"
          >
            🔐 Auth
          </Button>
        </div>
      </header>

      {/* Admin Token Input */}
      {showTokenPrompt && (
        <Card variant="default" padding="md" style={{ marginBottom: theme.spacing.lg }}>
          <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder='Admin token'
              value={adminToken}
              onChange={e=>setAdminToken(e.target.value)}
              aria-label="Admin token"
              type="password"
              style={{
                padding: theme.spacing.md,
                flex: '1 1 200px',
                minWidth: '200px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.neutral[300]}`,
                fontSize: theme.fontSizes.base,
                fontFamily: 'inherit',
              }}
            />
            <Button onClick={saveToken} size="md">Save Token</Button>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            color: theme.colors.danger[600],
            background: theme.colors.danger[50],
            padding: theme.spacing.md,
            borderRadius: theme.radii.lg,
            marginBottom: theme.spacing.lg,
            border: `1px solid ${theme.colors.danger[200]}`,
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Timer Display */}
      {remainingSeconds !== null && !isFinished && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <Badge variant={getTimerVariant()} size="lg">
            ⏱️ Time Left: {remainingSeconds}s
          </Badge>
        </div>
      )}

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: theme.spacing.xl,
        alignItems: 'flex-start',
      }}>
        {/* Main Content Area */}
        <main style={{ flex: isMobile ? '1' : '3 1 600px' }}>
          {/* Waiting to Start */}
          {!quizStarted && !isFinished && (
            <Card variant="gradient" padding="xl">
              <h2 style={{ marginTop: 0 }}>🎯 Ready to Start</h2>
              <p style={{
                margin: `${theme.spacing.sm} 0 ${theme.spacing.lg}`,
                color: theme.colors.neutral[600],
                fontSize: theme.fontSizes.lg,
              }}>
                Participants joined: <strong style={{ color: theme.colors.primary[600] }}>{participants.length}</strong>
              </p>
              <Button
                onClick={() => callAdmin('start')}
                size="lg"
                leftIcon="▶"
                aria-label="Start the quiz"
              >
                Start Quiz
              </Button>
              <div style={{ marginTop: theme.spacing.xl }}>
                <div style={{
                  fontSize: theme.fontSizes.sm,
                  marginBottom: theme.spacing.sm,
                  color: theme.colors.neutral[600],
                }}>
                  Share this QR code with participants:
                </div>
                <div style={{
                  background: '#fff',
                  padding: theme.spacing.lg,
                  display: 'inline-block',
                  borderRadius: theme.radii.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  boxShadow: theme.shadows.md,
                }}>
                  <QRCode value={participantUrl} size={128} />
                </div>
                <div style={{
                  marginTop: theme.spacing.sm,
                  fontSize: theme.fontSizes.xs,
                  color: theme.colors.neutral[500],
                }}>
                  {participantUrl}
                </div>
              </div>
            </Card>
          )}

          {/* Quiz Navigation */}
          {quizStarted && !isFinished && (
            <div style={{ marginBottom: theme.spacing.lg, display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              <Button
                onClick={() => callAdmin('prev')}
                disabled={currentIndex <= 0}
                variant="secondary"
                leftIcon="◀"
                aria-label="Previous question"
              >
                Prev
              </Button>
              <Button
                onClick={() => callAdmin('next')}
                rightIcon="▶"
                aria-label="Next question"
              >
                Next
              </Button>
              <Button
                onClick={() => callAdmin('reveal')}
                disabled={!q || state.state.reveal_answer}
                variant="secondary"
                aria-label="Reveal correct answer"
              >
                Reveal Answer
              </Button>
              {remainingSeconds !== null && (
                <Button
                  onClick={extendTimer}
                  variant="ghost"
                  size="sm"
                  aria-label="Add 10 seconds"
                >
                  +10s ⏱️
                </Button>
              )}
            </div>
          )}

          {/* Quiz Finished */}
          {isFinished && (
            <Card variant="gradient" padding="xl" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🎉</div>
              <h2 style={{ marginTop: 0 }}>Quiz Finished!</h2>
              <p style={{ color: theme.colors.neutral[600], fontSize: theme.fontSizes.lg }}>
                Great job everyone! Check out the final scores.
              </p>
              {state.final_image_url && (
                <div style={{ marginTop: theme.spacing.xl }}>
                  <img
                    src={state.final_image_url}
                    alt='Quiz completion'
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
            </Card>
          )}

          {/* Question Display */}
          {quizStarted && q && !isFinished && (
            <Card variant="elevated" padding="xl">
              {/* Question Image */}
              {q.image_url && (
                <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                  <img
                    src={q.image_url}
                    alt='Question illustration'
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: theme.radii.lg,
                      boxShadow: theme.shadows.md,
                    }}
                  />
                </div>
              )}

              {/* Question Counter */}
              <div style={{
                fontSize: theme.fontSizes.sm,
                color: theme.colors.neutral[600],
                marginBottom: theme.spacing.sm,
                fontWeight: theme.fontWeights.semibold,
              }}>
                Question {currentIndex + 1} of {totalQuestions}
              </div>

              {/* Question Text */}
              <h2 style={{
                marginTop: 0,
                marginBottom: theme.spacing.lg,
                color: theme.colors.neutral[900],
              }}>
                {q.text}
              </h2>

              {/* Answer Options */}
              <ol style={{
                fontSize: theme.fontSizes.lg,
                paddingLeft: theme.spacing.xl,
                margin: 0,
              }}>
                {q.options.map((opt, idx) => {
                  const isCorrect = q.correct_index === idx && state.state.reveal_answer;
                  return (
                    <li
                      key={idx}
                      style={{
                        margin: `${theme.spacing.sm} 0`,
                        padding: theme.spacing.md,
                        borderRadius: theme.radii.lg,
                        background: isCorrect ? theme.colors.success[100] : theme.colors.neutral[50],
                        border: isCorrect
                          ? `2px solid ${theme.colors.success[500]}`
                          : `1px solid ${theme.colors.neutral[200]}`,
                        fontWeight: isCorrect ? theme.fontWeights.semibold : theme.fontWeights.normal,
                        color: isCorrect ? theme.colors.success[700] : theme.colors.neutral[800],
                        boxShadow: isCorrect ? theme.shadows.md : 'none',
                        transition: `all ${theme.transitions.base}`,
                      }}
                    >
                      {opt} {isCorrect && '✓'}
                    </li>
                  );
                })}
              </ol>

              {/* Answer Distribution Chart */}
              {currentAgg && (
                <AnswerChart
                  options={q.options}
                  counts={currentAgg.counts}
                  correctIndex={q.correct_index}
                  revealed={state.state.reveal_answer}
                />
              )}
            </Card>
          )}
        </main>

        {/* Sidebar */}
        <aside
          style={{
            flex: isMobile ? '1' : '1 1 320px',
            minWidth: isMobile ? '100%' : '320px',
            maxHeight: isMobile ? 'none' : '80vh',
            overflowY: 'auto',
          }}
        >
          <Card variant="default" padding="lg">
            <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>
              👥 Participants ({participants.length})
            </h3>
            <ParticipantsList
              participants={participants}
              showAnswered={quizStarted && !isFinished}
            />
          </Card>

          {isFinished && (
            <div style={{ marginTop: theme.spacing.lg }}>
              <Scoreboard />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ParticipantsList({ participants, showAnswered }) {
  if (!participants.length) {
    return (
      <EmptyState
        icon="👥"
        title="No participants yet"
        description="Waiting for players to join"
      />
    );
  }

  return (
    <div style={{ marginTop: theme.spacing.sm }}>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
      }}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            {showAnswered && <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Status</th>}
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.participant_id}>
              <td style={tdStyle}>{p.name}</td>
              {showAnswered && (
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {p.answered_current ? (
                    <Badge variant="success" size="sm">✔</Badge>
                  ) : (
                    <span style={{
                      color: theme.colors.neutral[400],
                      fontSize: theme.fontSizes.lg,
                    }}>…</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: `1px solid ${theme.colors.neutral[200]}`,
  padding: theme.spacing.sm,
  background: theme.colors.neutral[50],
  textAlign: 'left',
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[700],
};

const tdStyle = {
  border: `1px solid ${theme.colors.neutral[200]}`,
  padding: theme.spacing.sm,
  fontSize: theme.fontSizes.sm,
};

