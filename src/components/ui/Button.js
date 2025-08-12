import React from 'react';

const variantClasses = {
  primary:
    'text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]',
  ghost:
    'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]',
  danger: 'text-white bg-[var(--color-danger)] hover:bg-red-600'
};

const sizeClasses = {
  md: 'h-11 px-4 text-sm', // 44px 可點擊高度
  lg: 'h-12 px-6 text-base'
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;


