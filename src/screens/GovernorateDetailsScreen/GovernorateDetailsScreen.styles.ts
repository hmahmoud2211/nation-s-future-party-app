import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Avatar of a local secretary / representative. */
export const CONTACT_AVATAR_SIZE = 38;
/** Phone glyph before the contact number. */
export const PHONE_ICON_SIZE = 12;

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    section: { marginTop: spacing.xl },
    coordinatorField: { marginTop: spacing.sm, marginBottom: 0 },
    list: { gap: spacing.sm },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    contactText: { flex: 1 },
    responsibilities: { marginTop: spacing.sm },
    phone: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  });
}
