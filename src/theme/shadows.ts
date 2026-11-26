import type { ViewStyle } from 'react-native';

/** Elevation tokens (CSS-style `boxShadow`, supported on iOS, Android and web). */
export const shadows = {
  /** Glass panes: a bright inner top edge (the light catching the rim) over a soft, wide float shadow. */
  card: { boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 8px 24px rgba(31, 45, 120, 0.10)' } as ViewStyle,
  /** Floating glass chrome (tab bar, toasts). */
  glass: { boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.85), 0px 12px 32px rgba(31, 45, 120, 0.18)' } as ViewStyle,
  raised: { boxShadow: '0px 10px 28px rgba(15, 25, 99, 0.14)' } as ViewStyle,
  /** Soft drop shadow under icon tiles and pills. */
  tile: { boxShadow: '0px 5px 12px rgba(35, 42, 110, 0.30)' } as ViewStyle,
  nav: { boxShadow: '0px 8px 22px rgba(35, 42, 110, 0.28)' } as ViewStyle,
  /** Toasts and dialogs. */
  overlay: { boxShadow: '0px 16px 40px rgba(11, 20, 80, 0.28)' } as ViewStyle,
  /** Sticky bottom bars. */
  bar: { boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.85), 0px -6px 20px rgba(15, 25, 99, 0.08)' } as ViewStyle,
  /** Focus ring for inputs. */
  focus: { boxShadow: '0px 0px 0px 3px rgba(15, 25, 99, 0.10)' } as ViewStyle,
  none: {} as ViewStyle,
};
