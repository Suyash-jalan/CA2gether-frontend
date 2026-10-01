import { motion } from 'framer-motion';

const variantStyles = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: '#FFFFFF',
    border: '2px solid transparent',
  },
  secondary: {
    backgroundColor: 'var(--color-secondary)',
    color: '#FFFFFF',
    border: '2px solid transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid transparent',
  },
  danger: {
    backgroundColor: 'var(--color-error)',
    color: '#FFFFFF',
    border: '2px solid transparent',
  },
  pass: {
    backgroundColor: 'var(--color-pass)',
    color: '#FFFFFF',
    border: '2px solid transparent',
  },
};

const sizeStyles = {
  sm: { padding: '8px 18px', fontSize: '0.875rem' },
  md: { padding: '12px 24px', fontSize: '1rem' },
  lg: { padding: '14px 32px', fontSize: '1.0625rem' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const vStyle = variantStyles[variant] || variantStyles.primary;
  const sStyle = sizeStyles[size] || sizeStyles.md;
  const effectiveVStyle = disabled
    ? variant === 'outline' || variant === 'ghost'
      ? { backgroundColor: 'transparent', color: 'var(--color-muted)', border: variant === 'outline' ? '2px solid var(--color-border)' : '2px solid transparent' }
      : { backgroundColor: 'var(--color-border)', color: 'var(--color-muted)', border: '2px solid transparent' }
    : vStyle;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.03, boxShadow: '0 8px 28px rgba(217,105,74,0.18)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        lineHeight: 1.2,
        borderRadius: '999px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
        outline: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        ...effectiveVStyle,
        ...sStyle,
      }}
      onFocus={(e) => {
        e.target.style.boxShadow = '0 0 0 3px rgba(217,105,74,0.3)';
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = '';
      }}
      {...props}
    >
      {loading ? (
        <>
          <motion.span
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              display: 'inline-block',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
          Loading…
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
