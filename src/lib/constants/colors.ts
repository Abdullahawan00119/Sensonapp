export const COLORS = {
  // Backgrounds
  bgVoid: '#070712',
  bgDeep: '#0A0A14',
  bgSurface: '#12121E',
  bgElevated: '#1A1A2E',
  bgGlass: 'rgba(255, 255, 255, 0.04)',
  bgGlassBorder: 'rgba(255, 255, 255, 0.07)',
  bgInputBorder: 'rgba(255, 255, 255, 0.10)',

  // Brand Accents
  accentIndigo: '#4F46E5',
  accentViolet: '#7C3AED',
  accentSoft: '#818CF8',

  // Statuses
  statusOk: '#22C55E',
  statusWarn: '#F59E0B',
  statusCrit: '#EF4444',
  statusInfo: '#06B6D4',

  // Typography — all readable on dark backgrounds
  textPrimary: '#F2F2FC',    // near-white, main content
  textSecondary: '#CACAE0',  // medium contrast, supporting text
  textMuted: '#C4C4DC',      // icons/hints — visible on dark bg
} as const;

export type AppColor = keyof typeof COLORS;
