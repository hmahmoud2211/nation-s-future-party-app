import React from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { colors, latinFonts, MAX_FONT_SCALE, typography, type TypographyVariant } from '@/theme';
import { localizeDigits } from '@/utils/format';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  /** Logical alignment. In the RTL root, `start` = right. */
  align?: 'start' | 'center' | 'end';
  /** Render digits in the app-wide numeral style — `NUMERAL_STYLE` in the theme (default true). */
  arabicDigits?: boolean;
  children?: React.ReactNode;
}

/** A run of Latin letters / digits (with inner punctuation and spaces), e.g. "22/11/2026", "9:36PM", "28°C - Sunny". */
const LATIN_RUN = /[A-Za-z0-9](?:[A-Za-z0-9°%/:.,+\-–_'· ]*[A-Za-z0-9%°])?/g;

/** Wraps Latin runs in a nested Text set in the matching Poppins weight; Arabic stays in the base font. */
function splitScripts(text: string, latinFamily: string | undefined, key: string): React.ReactNode {
  if (!latinFamily) return text;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LATIN_RUN)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(
      <Text key={`${key}-${at}`} style={{ fontFamily: latinFamily }}>
        {match[0]}
      </Text>,
    );
    last = at + match[0].length;
  }
  if (parts.length === 0) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function render(node: React.ReactNode, localize: boolean, latinFamily: string | undefined): React.ReactNode {
  const leaf = (value: string | number, key: string) => splitScripts(localize ? localizeDigits(value) : String(value), latinFamily, key);
  if (typeof node === 'string' || typeof node === 'number') return leaf(node, 't');
  if (Array.isArray(node)) {
    return node.map((n, i) => (typeof n === 'string' || typeof n === 'number' ? <React.Fragment key={i}>{leaf(n, `t${i}`)}</React.Fragment> : n));
  }
  return node;
}

/**
 * The only text component used in the app: Noto Sans Arabic with Poppins for numbers / Latin
 * (as in the design), RTL-aware alignment, the app-wide numeral style and a capped font scale.
 */
export function AppText({ variant = 'body', color = colors.text, align = 'start', arabicDigits = true, style, children, ...rest }: AppTextProps) {
  const alignStyle: TextStyle | undefined =
    align === 'center' ? styles.center : align === 'end' ? (Platform.OS === 'web' ? styles.left : styles.right) : undefined;
  const family = StyleSheet.flatten([typography[variant], style])?.fontFamily;
  const latinFamily = family ? latinFonts[family] : undefined;
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typography[variant], { color }, Platform.OS === 'ios' && styles.rtl, alignStyle, style]}
    >
      {render(children, arabicDigits, latinFamily)}
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
