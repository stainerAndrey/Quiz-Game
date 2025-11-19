import { theme } from '../../theme';

export default function EmptyState({
  icon = '📭',
  title = 'No data',
  description,
  action
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: theme.spacing['3xl'],
      color: theme.colors.neutral[500],
    }}>
      <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing.sm,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: theme.fontSizes.sm,
          marginBottom: theme.spacing.xl,
          color: theme.colors.neutral[600],
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

