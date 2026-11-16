import { ThemeMode } from '../types';

export const COLORS = {
  crimsonRed: '#DC2626',
  retroLedRed: '#EF4444',
  scarletGlow: '#F87171',
  deepOxblood: '#991B1B',
  warmIvory: '#FAF5F2',
  obsidianBlack: '#0A0809',
  pitchBlack: '#030203',
  smokedCharcoal: '#141012',
};

export interface ThemeColors {
  background: string;
  secondaryBg: string;
  cardBg: string;
  cardBgHover: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGradient: string;
  divider: string;
  playerBg: string;
  navbarBg: string;
  badgeBg: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  DARK: {
    background: '#0A0809',
    secondaryBg: '#141012',
    cardBg: '#191315',
    cardBgHover: '#241A1D',
    cardBorder: 'rgba(239, 68, 68, 0.22)',
    textPrimary: '#FAF5F2',
    textSecondary: '#B8A9AD',
    textMuted: '#7A6A6E',
    accent: '#DC2626',
    accentGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 55%, #991B1B 100%)',
    divider: 'rgba(239, 68, 68, 0.14)',
    playerBg: 'rgba(14, 10, 12, 0.98)',
    navbarBg: 'rgba(10, 8, 9, 0.96)',
    badgeBg: 'rgba(220, 38, 38, 0.18)',
  },
  AMOLED: {
    background: '#030203',
    secondaryBg: '#0B0809',
    cardBg: '#110C0E',
    cardBgHover: '#1B1215',
    cardBorder: 'rgba(239, 68, 68, 0.25)',
    textPrimary: '#FAF5F2',
    textSecondary: '#B0A0A5',
    textMuted: '#726266',
    accent: '#EF4444',
    accentGradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    divider: 'rgba(250, 245, 242, 0.09)',
    playerBg: 'rgba(3, 2, 3, 0.98)',
    navbarBg: 'rgba(3, 2, 3, 0.98)',
    badgeBg: '#260A0D',
  },
  LIGHT: {
    background: '#F5EFEA',
    secondaryBg: '#FFFDFB',
    cardBg: '#FFFDFB',
    cardBgHover: '#ECE2DC',
    cardBorder: 'rgba(185, 28, 28, 0.18)',
    textPrimary: '#140E10',
    textSecondary: '#5F4E53',
    textMuted: '#8D7B80',
    accent: '#DC2626',
    accentGradient: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
    divider: 'rgba(20, 14, 16, 0.09)',
    playerBg: 'rgba(255, 253, 251, 0.98)',
    navbarBg: 'rgba(245, 239, 234, 0.96)',
    badgeBg: '#FDE2E4',
  },
  SYSTEM: {
    background: '#0A0809',
    secondaryBg: '#141012',
    cardBg: '#191315',
    cardBgHover: '#241A1D',
    cardBorder: 'rgba(239, 68, 68, 0.22)',
    textPrimary: '#FAF5F2',
    textSecondary: '#B8A9AD',
    textMuted: '#7A6A6E',
    accent: '#DC2626',
    accentGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 55%, #991B1B 100%)',
    divider: 'rgba(239, 68, 68, 0.14)',
    playerBg: 'rgba(14, 10, 12, 0.98)',
    navbarBg: 'rgba(10, 8, 9, 0.96)',
    badgeBg: 'rgba(220, 38, 38, 0.18)',
  },
};

export const THEME_COLORS = THEMES;
