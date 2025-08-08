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
    background: ${tokens.colors.surfaceAlt};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button { font-family: inherit; }
`;

export default GlobalStyle;


