import { useEffect, useState } from "react";
import { API_BASE } from "../api.js";
import { theme } from "../theme.js";
import Button from "./ui/Button.jsx";
import { Skeleton } from "./ui/Skeleton.jsx";

export default function Scoreboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scoreboard`);
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        setError(detail.detail || `Error ${res.status}`);
        setEntries([]);
      } else {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (e) {
      setError(e.message || "Network error");
      setEntries([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getPodiumStyle = (rank) => {
    const styles = {
      1: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #f59e0b',
        fontSize: '1.1rem',
        fontWeight: 700,
        boxShadow: theme.shadows.lg,
      },
      2: {
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        border: '2px solid #9ca3af',
        boxShadow: theme.shadows.md,
      },
      3: {
        background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
        border: '2px solid #fb7185',
        boxShadow: theme.shadows.md,
      },
    };
    return styles[rank] || {};
  };

  const getMedal = (rank) => {
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return medals[rank] || `${rank}.`;
  };

  if (loading && entries.length === 0 && !error) {
    return (
      <div style={{ marginTop: theme.spacing.lg }}>
        <Skeleton height="3rem" width="60%" style={{ marginBottom: theme.spacing.lg }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} height="4rem" style={{ marginBottom: theme.spacing.md }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontStyle: "italic",
        color: theme.colors.neutral[600],
        textAlign: 'center',
        padding: theme.spacing.xl,
      }}>
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: theme.spacing['3xl'],
        color: theme.colors.neutral[500],
      }}>
        <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🏆</div>
        <p style={{ fontSize: theme.fontSizes.lg }}>No scores yet</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: theme.spacing.lg }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
      }}>
        <h2 style={{
          margin: 0,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🏆 Final Scores
        </h2>
        <Button onClick={load} size="sm" variant="secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {entries.map((entry, idx) => (
          <div
            key={entry.participant_id}
            role="listitem"
            aria-label={`${entry.name}: ${entry.percentage}% (${entry.correct} out of ${entry.total_questions} correct)`}
            style={{
              ...baseCardStyle,
              ...getPodiumStyle(idx + 1),
              animation: `scaleIn ${200 + idx * 100}ms ease-out`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
              <span
                style={{
                  fontSize: idx < 3 ? '2rem' : '1.25rem',
                  fontWeight: theme.fontWeights.bold,
                  minWidth: idx < 3 ? '3rem' : '2rem',
                  textAlign: 'center',
                }}
                aria-hidden="true"
              >
                {getMedal(idx + 1)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: theme.fontWeights.semibold,
                  fontSize: idx === 0 ? theme.fontSizes.xl : theme.fontSizes.lg,
                  marginBottom: '0.25rem',
                }}>
                  {entry.name}
                </div>
                <div style={{
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.neutral[600],
                  fontWeight: theme.fontWeights.normal,
                }}>
                  {entry.correct} / {entry.total_questions} correct · {entry.answered} answered
                </div>
              </div>
            </div>
            <div style={{
              fontSize: idx === 0 ? '2rem' : '1.5rem',
              fontWeight: theme.fontWeights.bold,
              color: idx === 0 ? '#f59e0b' : theme.colors.primary[600],
              minWidth: '4rem',
              textAlign: 'right',
            }}>
              {entry.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const baseCardStyle = {
  padding: theme.spacing.lg,
  borderRadius: theme.radii.xl,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: `all ${theme.transitions.base}`,
  border: `1px solid ${theme.colors.neutral[200]}`,
  background: '#ffffff',
};

