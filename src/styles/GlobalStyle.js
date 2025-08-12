import { createGlobalStyle } from 'styled-components';
import tokens from './tokens';

const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: ${tokens.colors.primary};
    --color-primary-hover: ${tokens.colors.primaryHover};
    --color-success: ${tokens.colors.success};
    --color-warning: ${tokens.colors.warning};
    --color-danger: ${tokens.colors.danger};
    --color-text-primary: ${tokens.colors.textPrimary};
    --color-text-secondary: ${tokens.colors.textSecondary};
    --color-border: ${tokens.colors.border};
    --color-surface: ${tokens.colors.surface};
    --color-surface-alt: ${tokens.colors.surfaceAlt};
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    color: var(--color-text-primary);
    background: linear-gradient(180deg, ${tokens.colors.surfaceAlt} 0%, #FFFFFF 60%);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button { font-family: inherit; }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: ${tokens.radius.lg}px;
    box-shadow: ${tokens.shadow.sm};
  }
`;

export default GlobalStyle;


