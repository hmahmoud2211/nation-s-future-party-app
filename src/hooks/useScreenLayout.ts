import { useWindowDimensions } from 'react-native';
import { breakpoints, layout } from '@/theme';

export interface ScreenLayout {
  width: number;
  height: number;
  /** Narrow phones (< 380pt): compact header. */
  isCompact: boolean;
  /** Below the 390pt phone width: compact dashboard cards. */
  isNarrow: boolean;
  /** Tablets / wide web windows. */
  isTablet: boolean;
  /** Dashboard gutter for the current width. */
  wideGutter: number;
}

/** Device class and widths. Size layouts from this hook, never from `Dimensions` directly. */
export function useScreenLayout(): ScreenLayout {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isCompact: width < breakpoints.compact,
    isNarrow: width < breakpoints.narrow,
    isTablet: width >= breakpoints.tablet,
    wideGutter: layout.wideGutter(width),
  };
}
