import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Weekday / day tile in the header card. */
const DATE_BOX_WIDTH = 56;
/** Video tile in the conference card. */
const CONF_ICON_SIZE = 38;
/** Glyph inside the conference tile. */
export const CONF_ICON_GLYPH_SIZE = 18;
/** Numbered agenda bullet. */
const AGENDA_NUMBER_SIZE = 24;
const COUNT_DOT_SIZE = 8;
export const ATTENDEE_AVATAR_SIZE = 34;
const MINUTES_INPUT_MIN_HEIGHT = 160;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth, typography } = theme;
  return StyleSheet.create({
    headCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.glassFaint,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.glassBorderSoft,
    },
    dateBox: { width: DATE_BOX_WIDTH, borderRadius: borderRadius.sm12, backgroundColor: colors.accentLight, alignItems: 'center', paddingVertical: spacing.xs6 },
    day: { ...typography.dateDay },
    headInfo: { flex: 1, gap: spacing.xxs },
    headBadges: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xxs },

    fill: { flex: 1 },
    minutesButton: { flex: 1.2 },

    liveCard: { borderColor: colors.success, backgroundColor: colors.successSoft },
    confHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    confIcon: { width: CONF_ICON_SIZE, height: CONF_ICON_SIZE, borderRadius: borderRadius.sm12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    confIconLive: { backgroundColor: colors.success },
    startButton: { marginTop: spacing.md },
    endButton: { marginTop: spacing.sm },
    simulatedNotice: { marginTop: spacing.sm },

    actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    block: { marginBottom: spacing.xl },
    agendaCard: { gap: spacing.sm },
    agendaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    num: { width: AGENDA_NUMBER_SIZE, height: AGENDA_NUMBER_SIZE, borderRadius: borderRadius.sm12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxs },
    counts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
    pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs5, backgroundColor: colors.frostStrong, borderRadius: borderRadius.pill, borderWidth: borderWidth.hairline, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.xxs3 },
    dot: { width: COUNT_DOT_SIZE, height: COUNT_DOT_SIZE, borderRadius: borderRadius.tiny },
    attendee: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm10 },
    border: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },

    minutesInput: { minHeight: MINUTES_INPUT_MIN_HEIGHT },
  });
}
