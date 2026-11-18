import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CircleCheck,
  CircleDot,
  CircleX,
  Clock,
  FilePlus,
  Lock,
  MessageSquare,
  Pencil,
  Play,
  RotateCcw,
  Send,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemberMap } from '@/store';
import { colors, radius, spacing, toneColors, type Tone } from '@/theme';
import type { TimelineEvent } from '@/types';
import { formatDateTime, formatRelative } from '@/utils/format';
import { AppText } from '../ui/AppText';

const MAP: Record<TimelineEvent['type'], { icon: LucideIcon; tone: Tone }> = {
  created: { icon: FilePlus, tone: 'navy' },
  updated: { icon: Pencil, tone: 'neutral' },
  submitted: { icon: Send, tone: 'info' },
  under_review: { icon: Clock, tone: 'warning' },
  approved: { icon: CircleCheck, tone: 'success' },
  rejected: { icon: CircleX, tone: 'error' },
  note: { icon: MessageSquare, tone: 'gold' },
  started: { icon: Play, tone: 'info' },
  progress: { icon: TrendingUp, tone: 'navy' },
  completed: { icon: CircleCheck, tone: 'success' },
  reopened: { icon: RotateCcw, tone: 'warning' },
  closed: { icon: Lock, tone: 'neutral' },
  replied: { icon: MessageSquare, tone: 'success' },
  assigned: { icon: UserPlus, tone: 'info' },
};

/** Vertical visual timeline (approval history, task history, feedback activity). */
export function Timeline({ events, pendingLabel }: { events: TimelineEvent[]; pendingLabel?: string }) {
  const members = useMemberMap();
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const items = pendingLabel ? [...sorted, null] : sorted;
  return (
    <View>
      {items.map((e, i) => {
        const last = i === items.length - 1;
        if (!e) {
          return (
            <View key="pending" style={styles.item}>
              <View style={styles.rail}>
                <View style={[styles.dot, styles.pendingDot]}>
                  <CircleDot size={14} color={colors.textMuted} />
                </View>
              </View>
              <View style={[styles.body, { paddingBottom: 0 }]}>
                <AppText variant="captionMedium" color={colors.textSecondary}>
                  {pendingLabel}
                </AppText>
              </View>
            </View>
          );
        }
        const m = MAP[e.type] ?? MAP.note;
        const t = toneColors[m.tone];
        const Icon = m.icon;
        return (
          <View key={e.id} style={styles.item}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: t.bg, borderColor: t.fg }]}>
                <Icon size={14} color={t.fg} strokeWidth={2.4} />
              </View>
              {!last ? <View style={styles.line} /> : null}
            </View>
            <View style={[styles.body, last && { paddingBottom: 0 }]}>
              <AppText variant="cardTitle">{e.label}</AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {`${members[e.actorId]?.name ?? 'النظام'} • ${formatRelative(e.createdAt)}`}
              </AppText>
              {e.note ? (
                <View style={[styles.note, { borderColor: t.fg }]}>
                  <AppText variant="caption" color={colors.text}>
                    {e.note}
                  </AppText>
                </View>
              ) : null}
              <AppText variant="meta" color={colors.textMuted}>
                {formatDateTime(e.createdAt)}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 30 },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  pendingDot: { backgroundColor: colors.navyTint, borderColor: colors.borderStrong, borderStyle: 'dashed' },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  body: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
  note: { marginTop: spacing.xs, padding: spacing.sm + 2, backgroundColor: colors.bg, borderRadius: radius.sm, borderStartWidth: 3 },
});

export default Timeline;
