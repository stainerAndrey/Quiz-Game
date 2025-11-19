import { theme } from '../../theme';

function Spinner({ size = 'md' }) {
  const sizes = { sm: 14, md: 20, lg: 28 };
  return (
    <svg
      width={sizes[size]}
      height={sizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  ...props
}) {
  const variants = {
    primary: {
      background: theme.colors.primary[600],
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      background: '#ffffff',
      color: theme.colors.neutral[700],
      border: `1px solid ${theme.colors.neutral[300]}`,
    },
    danger: {
      background: theme.colors.danger[600],
      color: '#ffffff',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.neutral[700],
      border: 'none',
    },
  };

  const sizes = {
    sm: { padding: '0.375rem 0.75rem', fontSize: theme.fontSizes.sm },
    md: { padding: '0.625rem 1rem', fontSize: theme.fontSizes.base },
    lg: { padding: '0.75rem 1.5rem', fontSize: theme.fontSizes.lg },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radii.lg,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: `all ${theme.transitions.base}`,
    fontFamily: 'inherit',
    boxShadow: theme.shadows.sm,
    minHeight: '44px',
    ...sizes[size],
    ...variants[variant],
  };

  return (
    <button style={baseStyle} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
}

