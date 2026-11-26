import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export const PROFILE_AVATAR_SIZE = 50;
export const CONTACT_ICON_SIZE = 13;
export const LINK_ICON_SIZE = 17;
const LINK_ICON_BOX_SIZE = 32;
const LINK_PADDING_VERTICAL = 11;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    profileText: { flex: 1, gap: spacing.xxs3 },
    contact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs6,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: borderWidth.hairline,
      borderTopColor: colors.border,
    },
    section: { marginTop: spacing.xl },
    sessionActions: { gap: spacing.sm },
    link: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm10, paddingHorizontal: spacing.md, paddingVertical: LINK_PADDING_VERTICAL },
    linkBorder: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
    linkIcon: {
      width: LINK_ICON_BOX_SIZE,
      height: LINK_ICON_BOX_SIZE,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkLabel: { flex: 1 },
  });
}
