// Spacing tokens for Digital Sales CRM
// 4px base grid system

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  sm: '6px',    // Small controls, badges
  md: '8px',    // Inputs, buttons
  lg: '12px',   // Cards
  xl: '16px',   // Large panels, modals
  full: '9999px', // Pills, avatars
} as const;

export const layout = {
  sidebar: {
    expanded: '240px',
    collapsed: '72px',
  },
  topbar: {
    height: '64px',
  },
  content: {
    paddingX: '32px',
    paddingY: '28px',
    sectionGap: '24px',
    maxWidth: '1600px',
  },
} as const;

export const breakpoints = {
  sm: '375px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
  '3xl': '1920px',
} as const;
