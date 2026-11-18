import React from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { colors, MAX_FONT_SCALE, typography, type TypographyVariant } from '@/theme';
import { toArabicDigits } from '@/utils/format';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  /** Logical alignment. In the RTL root, `start` = right. */
  align?: 'start' | 'center' | 'end';
  /** Convert Western digits to Arabic-Indic digits (default true). */
  arabicDigits?: boolean;
  children?: React.ReactNode;
}

function convert(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string' || typeof node === 'number') return toArabicDigits(node);
  if (Array.isArray(node)) return node.map((n, i) => (typeof n === 'string' || typeof n === 'number' ? <React.Fragment key={i}>{toArabicDigits(n)}</React.Fragment> : n));
  return node;
}

/**
 * The only text component used in the app: Cairo font, RTL-aware alignment,
 * Arabic-Indic digits and a capped font scale for accessibility.
 */
export function AppText({ variant = 'body', color = colors.text, align = 'start', arabicDigits = true, style, children, ...rest }: AppTextProps) {
  const alignStyle: TextStyle | undefined =
    align === 'center' ? styles.center : align === 'end' ? (Platform.OS === 'web' ? styles.left : styles.right) : undefined;
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typography[variant], { color }, Platform.OS === 'ios' && styles.rtl, alignStyle, style]}
    >
      {arabicDigits ? convert(children) : children}
    </Text>
  );
}

const styles = StyleSheet.create({
  rtl: { writingDirection: 'rtl' },
  center: { textAlign: 'center' },
  // Under the RTL root, native platforms treat `right` as "end" (physical left).
  right: { textAlign: 'right' },
  left: { textAlign: 'left' },
});

export default AppText;
