const tokens = {
  colors: {
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    backdrop: 'rgba(15, 23, 42, 0.45)'
  },
  radius: { xs: 6, sm: 8, md: 12, lg: 16 },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.12)',
    md: '0 6px 16px rgba(15, 23, 42, 0.12)',
    lg: '0 12px 32px rgba(15, 23, 42, 0.15)'
  },
  z: { nav: 20, sheet: 40, toast: 50 },
  spacing: (n) => `${n * 8}px`
};

export default tokens;


