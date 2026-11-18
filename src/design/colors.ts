// Design Color Tokens for Digital Sales CRM
// Do NOT hardcode colors — always import from here

export const colors = {
  // Primary brand — Teal
  primary: {
    900: '#0A4A44',
    800: '#0C534D',
    700: '#0E5F58',
    600: '#147D72',
    500: '#24988A',
    400: '#3AADA0',
    300: '#6DC5BB',
    200: '#A3DCD5',
    100: '#DDF2EE',
    50: '#E8F3F1',
    soft: '#E8F3F1',
  },

  // Supporting accents
  accent: {
    blue: '#5279C7',
    blueSoft: '#EAF1FC',
    purple: '#8266C9',
    purpleSoft: '#F0ECFA',
  },

  // Neutral palette
  neutral: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFB',
    border: '#E7EAEE',
    borderLight: '#F0F2F5',
    text: '#20252D',
    textSecondary: '#68717D',
    textMuted: '#969EAA',
    textDisabled: '#BEC3CB',
  },

  // Semantic
  semantic: {
    success: '#16865D',
    successBg: '#E8F6EF',
    successLight: '#D1F0E0',
    warning: '#B7791F',
    warningBg: '#FFF5E5',
    warningLight: '#FFEDC8',
    danger: '#C74747',
    dangerBg: '#FCECEC',
    dangerLight: '#F9D4D4',
    info: '#4778C7',
    infoBg: '#EAF1FC',
    infoLight: '#D6E4F9',
  },

  // Status-specific (for lead statuses)
  status: {
    new: '#4778C7',
    newBg: '#EAF1FC',
    contacted: '#5279C7',
    contactedBg: '#EAF1FC',
    interested: '#24988A',
    interestedBg: '#DDF2EE',
    followUp: '#B7791F',
    followUpBg: '#FFF5E5',
    pending: '#B7791F',
    pendingBg: '#FFF5E5',
    confirmed: '#16865D',
    confirmedBg: '#E8F6EF',
    notInterested: '#C74747',
    notInterestedBg: '#FCECEC',
    unqualified: '#C74747',
    unqualifiedBg: '#FCECEC',
    invalid: '#C74747',
    invalidBg: '#FCECEC',
    archived: '#969EAA',
    archivedBg: '#F5F6F8',
  },
} as const;

// Status color lookup helper
export function getStatusColor(status: string): { text: string; bg: string } {
  const key = status.toLowerCase().replace(/[\s-]/g, '') as keyof typeof colors.status;
  const bgKey = `${key}Bg` as keyof typeof colors.status;
  
  if (key in colors.status && bgKey in colors.status) {
    return { text: colors.status[key], bg: colors.status[bgKey] };
  }
  
  return { text: colors.neutral.textSecondary, bg: colors.neutral.surfaceMuted };
}

// Priority color lookup
export const priorityColors = {
  critical: { text: '#C74747', bg: '#FCECEC' },
  high: { text: '#B7791F', bg: '#FFF5E5' },
  medium: { text: '#4778C7', bg: '#EAF1FC' },
  low: { text: '#969EAA', bg: '#F5F6F8' },
  none: { text: '#969EAA', bg: '#F5F6F8' },
} as const;
