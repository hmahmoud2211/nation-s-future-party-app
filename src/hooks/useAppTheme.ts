import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import type { AppTheme } from '@/types/theme.types';

/** The current theme (tokens). Screens build their styles from it with `createStyles(theme)`. */
export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}
