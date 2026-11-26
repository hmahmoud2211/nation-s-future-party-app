import React, { createContext } from 'react';
import { appTheme } from '@/theme';
import type { AppTheme } from '@/types/theme.types';

/** Provides the design system to every screen. The app has a single (light) theme. */
export const ThemeContext = createContext<AppTheme>(appTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>;
}
