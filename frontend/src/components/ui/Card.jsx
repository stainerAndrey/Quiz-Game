import { theme } from '../../theme';

export default function Card({ children, variant = 'default', padding = 'lg', ...props }) {
  const variants = {
    default: {
      background: '#ffffff',
      border: `1px solid ${theme.colors.neutral[200]}`,
    },
    elevated: {
      background: '#ffffff',
      border: 'none',
      boxShadow: theme.shadows.lg,
    },
    gradient: {
      background: `linear-gradient(135deg, #ffffff 0%, ${theme.colors.primary[50]} 100%)`,
      border: `1px solid ${theme.colors.primary[100]}`,
    },
  };

  const paddings = {
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
    xl: theme.spacing['2xl'],
  };

  const style = {
    borderRadius: theme.radii.xl,
    padding: paddings[padding],
    ...variants[variant],
  };

  return <div style={style} {...props}>{children}</div>;
}

