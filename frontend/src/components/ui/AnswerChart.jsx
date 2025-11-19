import { theme } from '../../theme';

export default function AnswerChart({ options, counts, correctIndex, revealed }) {
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div style={{ marginTop: theme.spacing.lg }}>
      <h3 style={{
        fontSize: theme.fontSizes.sm,
        marginBottom: theme.spacing.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral[700],
      }}>
        Answer Distribution
      </h3>
      {options.map((opt, idx) => {
        const percentage = total > 0 ? (counts[idx] / total) * 100 : 0;
        const isCorrect = revealed && idx === correctIndex;

        return (
          <div key={idx} style={{ marginBottom: theme.spacing.sm }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: theme.fontSizes.sm,
              marginBottom: '0.25rem',
              color: theme.colors.neutral[700],
            }}>
              <span style={{ fontWeight: isCorrect ? theme.fontWeights.semibold : theme.fontWeights.normal }}>
                {opt} {isCorrect && '✓'}
              </span>
              <span>{counts[idx]} ({percentage.toFixed(0)}%)</span>
            </div>
            <div style={{
              height: '8px',
              background: theme.colors.neutral[200],
              borderRadius: theme.radii.full,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: isCorrect
                  ? theme.colors.success[500]
                  : theme.colors.primary[500],
                transition: `width ${theme.transitions.slow}`,
                borderRadius: theme.radii.full,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

