// Typography tokens for Digital Sales CRM
// Using Inter font family

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  fontSize: {
    pageTitle: { size: '28px', lineHeight: '36px', weight: '600' },
    sectionTitle: { size: '20px', lineHeight: '28px', weight: '600' },
    cardHeading: { size: '16px', lineHeight: '24px', weight: '600' },
    body: { size: '14px', lineHeight: '22px', weight: '400' },
    bodyMedium: { size: '14px', lineHeight: '22px', weight: '500' },
    table: { size: '13px', lineHeight: '20px', weight: '400' },
    label: { size: '12px', lineHeight: '16px', weight: '500' },
    labelSmall: { size: '11px', lineHeight: '14px', weight: '500' },
    kpiValue: { size: '32px', lineHeight: '40px', weight: '600' },
    kpiValueSmall: { size: '24px', lineHeight: '32px', weight: '600' },
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  fontFeatures: {
    tabularNums: '"tnum"',
    proportionalNums: '"pnum"',
  },
} as const;
