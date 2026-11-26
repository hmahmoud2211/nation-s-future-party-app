import type { ViewStyle } from 'react-native';

/** Elevation tokens (CSS-style `boxShadow`, supported on iOS, Android and web). */
export const shadows = {
  /** Cards are outlined in the design; keep their shadow nearly invisible. */
  card: { boxShadow: '0px 1px 3px rgba(15, 25, 99, 0.04)' } as ViewStyle,
  raised: { boxShadow: '0px 10px 28px rgba(15, 25, 99, 0.14)' } as ViewStyle,
  /** Soft drop shadow under icon tiles and pills. */
  tile: { boxShadow: '0px 5px 12px rgba(35, 42, 110, 0.30)' } as ViewStyle,
  nav: { boxShadow: '0px 8px 22px rgba(35, 42, 110, 0.28)' } as ViewStyle,
  /** Toasts and dialogs. */
  overlay: { boxShadow: '0px 16px 40px rgba(11, 20, 80, 0.28)' } as ViewStyle,
  /** Sticky bottom bars. */
  bar: { boxShadow: '0px -4px 16px rgba(15, 25, 99, 0.06)' } as ViewStyle,
  /** Focus ring for inputs. */
  focus: { boxShadow: '0px 0px 0px 3px rgba(15, 25, 99, 0.10)' } as ViewStyle,
  none: {} as ViewStyle,
};
