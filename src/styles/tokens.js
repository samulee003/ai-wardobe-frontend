const tokens = {
  colors: {
    primary: '#5B55E3',
    primaryHover: '#4A43D1',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    border: '#E2E8F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F7F8FB',
    backdrop: 'rgba(15, 23, 42, 0.45)'
  },
  radius: { xs: 8, sm: 10, md: 12, lg: 16 },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
    md: '0 6px 16px rgba(15, 23, 42, 0.10)',
    lg: '0 12px 24px rgba(15, 23, 42, 0.12)'
  },
  z: { nav: 20, sheet: 40, toast: 50 },
  spacing: (n) => `${n * 8}px`
};

export default tokens;


