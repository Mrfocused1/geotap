export const Colors = {
  primary: {
    DEFAULT: '#0d9488',
    50: '#f0fdfa',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    900: '#134e4a',
  },
  accent: {
    DEFAULT: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  background: {
    light: '#ffffff',
    dark: '#0f172a',
  },
  surface: {
    light: '#f8fafc',
    dark: '#1e293b',
  },
  text: {
    light: '#0f172a',
    dark: '#f1f5f9',
    muted: '#64748b',
  },
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },
} as const;

export type ColorPalette = typeof Colors;
