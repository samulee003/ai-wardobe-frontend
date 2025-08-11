import React from 'react';

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-700',
  secondary: 'bg-surface text-textPrimary border border-border hover:bg-surfaceAlt',
  ghost: 'bg-transparent text-textPrimary hover:bg-surfaceAlt',
  danger: 'bg-danger text-white hover:bg-red-600'
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
    'inline-flex items-center justify-center font-semibold rounded-md transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
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


