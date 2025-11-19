import { theme } from '../../theme';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    success: { bg: theme.colors.success[100], color: theme.colors.success[700] },
    warning: { bg: theme.colors.warning[50], color: theme.colors.warning[600] },
    danger: { bg: theme.colors.danger[50], color: theme.colors.danger[600] },
    info: { bg: theme.colors.primary[100], color: theme.colors.primary[700] },
    default: { bg: theme.colors.neutral[100], color: theme.colors.neutral[700] },
  };

  const sizes = {
    sm: { padding: '0.125rem 0.5rem', fontSize: theme.fontSizes.xs },
    md: { padding: '0.25rem 0.75rem', fontSize: theme.fontSizes.sm },
    lg: { padding: '0.375rem 1rem', fontSize: theme.fontSizes.base },
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: theme.radii.full,
    fontWeight: theme.fontWeights.semibold,
    background: variants[variant].bg,
    color: variants[variant].color,
    ...sizes[size],
  };

  return <span style={style}>{children}</span>;
}

