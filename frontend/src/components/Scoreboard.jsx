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

  const totalPlayers = entries.length;
  const averageScore = totalPlayers
    ? Math.round((entries.reduce((sum, entry) => sum + entry.percentage, 0) / totalPlayers) * 10) / 10
    : 0;
  const perfectPlayers = entries.filter((entry) => entry.correct === entry.total_questions).length;
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <section
      style={{
        width: '100%',
        marginTop: theme.spacing.xl,
        background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)',
        borderRadius: theme.radii.xl,
        padding: 'clamp(1rem, 1.5vw, 2rem)',
        boxShadow: theme.shadows.lg,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: theme.fontSizes['2xl'],
            color: theme.colors.neutral[900],
          }}>
            🏆 Final Scores
          </h2>
          <p style={{ margin: 0, color: theme.colors.neutral[600], fontSize: theme.fontSizes.sm }}>
            {totalPlayers} players · Avg accuracy {averageScore}% · Perfect runs {perfectPlayers}
          </p>
        </div>
        <Button onClick={load} size="sm" variant="secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: podium.length > 1 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
          gap: theme.spacing.md,
          marginBottom: rest.length ? theme.spacing.sm : 0,
        }}
      >
        {podium.map((entry, idx) => (
          <ScoreCard
            key={entry.participant_id}
            entry={entry}
            rank={idx + 1}
          />
        ))}
      </div>

      {rest.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: theme.spacing.md,
          }}
        >
          {rest.map((entry, idx) => (
            <ScoreCard
              key={entry.participant_id}
              entry={entry}
              rank={idx + 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ScoreCard({ entry, rank }) {
  const accent = getAccent(rank);
  const rankLabel = rank <= 3 ? `Podium #${rank}` : `Rank #${rank}`;
  return (
    <article
      style={{
        padding: theme.spacing.lg,
        borderRadius: theme.radii.xl,
        background: accent.background,
        border: accent.border,
        boxShadow: accent.shadow,
        color: accent.text,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: theme.spacing.md, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, minWidth: 0 }}>
          <span style={{ fontSize: rank <= 3 ? '2.5rem' : '1.5rem' }}>{accent.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: theme.fontWeights.bold,
              fontSize: rank <= 3 ? theme.fontSizes['2xl'] : theme.fontSizes.lg,
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}>
              {entry.name}
            </div>
            <div style={{ fontSize: theme.fontSizes.sm, color: accent.subtleText }}>
              {rankLabel}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: rank <= 3 ? '2.5rem' : '1.75rem', fontWeight: theme.fontWeights.bold, color: accent.score }}>
            {entry.percentage}%
          </div>
          <div style={{ fontSize: theme.fontSizes.xs, color: accent.subtleText }}>
            accuracy
          </div>
        </div>
      </div>
      <div style={{ fontSize: theme.fontSizes.sm, color: accent.subtleText, display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
        <span>Correct: <strong>{entry.correct}</strong> / {entry.total_questions}</span>
        <span>Answered: <strong>{entry.answered}</strong></span>
      </div>
      <div style={{ height: '6px', background: accent.progressBg, borderRadius: theme.radii.full }}>
        <div
          style={{
            width: `${entry.percentage}%`,
            height: '100%',
            borderRadius: theme.radii.full,
            background: accent.progress,
            transition: `width ${theme.transitions.slow}`,
          }}
        />
      </div>
    </article>
  );
}

function getAccent(rank) {
  const palette = {
    1: {
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      border: '1px solid #fbbf24',
      shadow: theme.shadows.lg,
      text: '#78350f',
      subtleText: '#b45309',
      score: '#b45309',
      progress: '#f59e0b',
      progressBg: 'rgba(245, 158, 11, 0.2)',
      icon: '🥇',
    },
    2: {
      background: 'linear-gradient(135deg, #e5e7eb, #f3f4f6)',
      border: '1px solid #9ca3af',
      shadow: theme.shadows.md,
      text: '#1f2937',
      subtleText: '#6b7280',
      score: '#4b5563',
      progress: '#9ca3af',
      progressBg: 'rgba(156, 163, 175, 0.3)',
      icon: '🥈',
    },
    3: {
      background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
      border: '1px solid #fb7185',
      shadow: theme.shadows.md,
      text: '#9f1239',
      subtleText: '#be123c',
      score: '#be123c',
      progress: '#f472b6',
      progressBg: 'rgba(244, 114, 182, 0.2)',
      icon: '🥉',
    },
  };

  return palette[rank] || {
    background: '#ffffffcc',
    border: `1px solid ${theme.colors.neutral[200]}`,
    shadow: theme.shadows.sm,
    text: theme.colors.neutral[900],
    subtleText: theme.colors.neutral[500],
    score: theme.colors.primary[600],
    progress: theme.colors.primary[500],
    progressBg: 'rgba(37, 99, 235, 0.15)',
    icon: `${rank}.`,
  };
}
