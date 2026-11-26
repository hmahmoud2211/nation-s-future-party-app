import React, { useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarClock,
  CalendarPlus,
  CalendarSync,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  ChevronLeft,
  FilePenLine,
  Lightbulb,
  MapPin,
  Newspaper,
  type LucideIcon,
} from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { CountPill } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { CalendarSparkle } from '@/components/common/customIcons';
import { IconTile } from '@/components/common/IconTile';
import { PressableScale } from '@/components/common/PressableScale';
import { EmptyState } from '@/components/feedback/States';
import { FormSelect } from '@/components/forms/FormSelect';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatRings, type StatRingItem } from '@/components/ui/ProgressRing';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QuickAction, QuickActionGrid } from '@/components/ui/StatCard';
import { TrendChart } from '@/components/ui/TrendChart';
import type { Announcement } from '@/features/announcements/types';
import { useUser } from '@/features/auth/hooks/useSession';
import { canCreateMeeting, canSubmitAnyProposal } from '@/features/auth/services/permissions';
import { useCommitteeMap } from '@/features/committees/hooks/useCommittees';
import type { Governorate, GovernorateContact } from '@/features/governorates/types';
import type { Meeting } from '@/features/meetings/types';
import { implementationRate, initiativeBreakdown, type InitiativeBreakdown, type MonthlyPoint } from '@/features/proposals/services/initiatives';
import type { Proposal } from '@/features/proposals/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { formatNumber, formatNumericDate, formatPercent, formatRelative, formatWeekday } from '@/utils/format';
import { homeCopy as copy } from './HomeScreen.data';
import { COMPACT_TILE_SIZE, createStyles, GOVERNORATE_RING_SIZE, MEETING_ACCENT_WIDTH, RATING_BAR_HEIGHT } from './HomeScreen.styles';

function useStyles() {
  const theme = useAppTheme();
  return { theme, styles: useMemo(() => createStyles(theme), [theme]) };
}

/** Ring order follows the design (right → left in RTL). */
function ringItems(b: InitiativeBreakdown): StatRingItem[] {
  return [
    { key: 'in_progress', label: copy.ringInProgress, value: b.inProgress, tone: 'blue' },
    { key: 'completed', label: copy.ringCompleted, value: b.completed, tone: 'navy' },
    { key: 'under_study', label: copy.ringUnderStudy, value: b.underStudy, tone: 'teal' },
  ];
}

// ───────────── أداء الحزب — previous / next meeting ─────────────

function MeetingHighlightCard({ label, icon, meeting, style }: { label: string; icon: LucideIcon; meeting?: Meeting; style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { theme, styles } = useStyles();
  // Below ~390pt the row is tighter than the 430pt design: step the type down so it stays on one line.
  const { isNarrow: compact } = useScreenLayout();
  const weekday = meeting ? formatWeekday(meeting.date) : '';
  const date = meeting ? formatNumericDate(meeting.date) : copy.none;
  return (
    <Card
      onPress={() => (meeting ? router.push(`/meetings/${meeting.id}`) : router.navigate('/meetings'))}
      accessibilityLabel={meeting ? copy.meetingA11y(label, weekday, date, meeting.title) : copy.meetingA11yNone(label)}
      accessibilityHint={meeting ? copy.openMeetingHint : copy.openMeetingsHint}
      accentColor={theme.colors.primaryDark}
      accentPosition="end"
      accentWidth={MEETING_ACCENT_WIDTH}
      padded={false}
      style={[styles.meetingCard, style]}
    >
      <IconTile icon={icon} size={compact ? COMPACT_TILE_SIZE : undefined} />
      <AppText variant="subheading" numberOfLines={2} style={[styles.meetingLabel, compact && styles.meetingLabelCompact]}>
        {copy.labelSuffix(label)}
      </AppText>
      <View style={styles.meetingDate}>
        {weekday ? (
          <AppText variant="subheading" color={theme.colors.secondaryDark} style={[styles.weekday, compact && styles.weekdayCompact]} numberOfLines={1}>
            {weekday}
          </AppText>
        ) : null}
        <AppText variant="subheading" color={theme.colors.textSecondary} style={[styles.dateText, compact && styles.dateCompact]} numberOfLines={1}>
          {date}
        </AppText>
      </View>
    </Card>
  );
}

export function PartyPerformanceSection({ previous, next }: { previous?: Meeting; next?: Meeting }) {
  const { styles } = useStyles();
  return (
    <View>
      <SectionHeader title={copy.performanceTitle} icon={ChartNoAxesCombined} />
      <MeetingHighlightCard label={copy.previousMeeting} icon={CalendarClock} meeting={previous} />
      <MeetingHighlightCard label={copy.nextMeeting} icon={CalendarSync} meeting={next} style={styles.meetingGap} />
    </View>
  );
}

// ───────────── عدد المبادرات ─────────────

export function InitiativesSection({ breakdown }: { breakdown: InitiativeBreakdown }) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.section}>
      <SectionHeader
        title={copy.initiativesTitle}
        icon={Lightbulb}
        trailing={<CountPill value={formatNumber(breakdown.total)} accessibilityLabel={copy.initiativesTotalA11y(breakdown.total)} />}
      />
      <Card onPress={() => router.navigate('/proposals')} accessibilityHint={copy.showProposalsHint} style={styles.ringsCard}>
        <StatRings items={ringItems(breakdown)} total={breakdown.total} />
      </Card>
    </View>
  );
}

// ───────────── عدد المبادرات التي تم تنفيذها ─────────────

export function ImplementedChartSection({ data }: { data: MonthlyPoint[] }) {
  const { styles } = useStyles();
  return (
    <View style={styles.section}>
      <SectionHeader title={copy.implementedTitle} icon={ChartColumnIncreasing} />
      <Card style={styles.chartCard}>
        <TrendChart data={data} accessibilityLabel={copy.implementedA11y(data)} />
      </Card>
    </View>
  );
}

// ───────────── Quick actions ─────────────

export function HomeQuickActions() {
  const router = useRouter();
  const user = useUser();
  const { styles } = useStyles();
  const committeeId = user.managedCommitteeIds[0];
  const q = committeeId ? `?committeeId=${committeeId}` : '';
  return (
    <View style={styles.section}>
      <QuickActionGrid>
        {canSubmitAnyProposal(user) ? <QuickAction icon={FilePenLine} label={copy.submitProposal} onPress={() => router.push(`/proposals/new${q}`)} /> : null}
        {canCreateMeeting(user) ? <QuickAction icon={CalendarPlus} label={copy.newMeeting} onPress={() => router.push(`/meetings/new${q}`)} /> : null}
        <QuickAction icon={CalendarSparkle} label={copy.events} onPress={() => router.push('/activities')} />
      </QuickActionGrid>
    </View>
  );
}

// ───────────── المحافظات ─────────────

function GradientDivider() {
  const { theme, styles } = useStyles();
  return <LinearGradient colors={theme.gradients.divider} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.divider} />;
}

function LabeledValue({ label, value }: { label: string; value?: string }) {
  const { theme, styles } = useStyles();
  return (
    <View style={styles.labeled}>
      <AppText variant="subheading" style={styles.medium} numberOfLines={1}>
        {copy.labelSuffix(label)}
      </AppText>
      <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
        {value || copy.emptyValue}
      </AppText>
    </View>
  );
}

export function GovernorateSection({
  governorates,
  defaultId,
  contacts,
  proposals,
}: {
  governorates: Governorate[];
  defaultId?: string;
  contacts: GovernorateContact[];
  proposals: Proposal[];
}) {
  const { theme, styles } = useStyles();
  const [selected, setSelected] = useState(defaultId);
  const current = governorates.find((g) => g.id === selected) ?? governorates[0];
  const options = useMemo(() => governorates.map((g) => ({ value: g.id, label: copy.governorateOption(g.name), description: g.region })), [governorates]);
  const secretary = contacts.find((c) => c.governorateId === current?.id && !c.committeeId);
  const breakdown = useMemo(() => initiativeBreakdown(proposals.filter((p) => p.governorateId === current?.id)), [proposals, current?.id]);
  const rate = implementationRate(breakdown);
  if (!current) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={copy.governoratesTitle} icon={MapPin} />
      <Card style={styles.govCard}>
        <FormSelect variant="filled" options={options} value={current.id} onChange={(v) => v && setSelected(v)} title={copy.chooseGovernorate} placeholder={copy.chooseGovernorate} />
        <View style={styles.govInfo}>
          <LabeledValue label={copy.governorateSecretary} value={secretary?.name} />
          <LabeledValue label={copy.contactNumber} value={secretary?.phone} />
        </View>
        <GradientDivider />
        <AppText variant="subheading" style={[styles.medium, styles.govCountTitle]}>
          {copy.initiativesCount}
        </AppText>
        <StatRings items={ringItems(breakdown)} total={breakdown.total} size={GOVERNORATE_RING_SIZE} />
        <View style={styles.rating}>
          <AppText variant="subheading" style={styles.medium}>
            {copy.rating}
          </AppText>
          <AppText variant="meta" color={theme.colors.text} style={styles.ratingValue}>
            {formatPercent(rate)}
          </AppText>
          <ProgressBar
            value={rate}
            gradient={theme.gradients.progress}
            fillFrom="end"
            trackColor={theme.colors.divider}
            height={RATING_BAR_HEIGHT}
            accessibilityLabel={copy.ratingA11y(current.name, rate)}
            style={styles.ratingBar}
          />
        </View>
      </Card>
    </View>
  );
}

// ───────────── أهم الأخبار ─────────────

export function NewsSection({ news }: { news: Announcement[] }) {
  const router = useRouter();
  const committees = useCommitteeMap();
  const user = useUser();
  const { theme, styles } = useStyles();
  return (
    <View style={styles.section}>
      <SectionHeader title={copy.newsTitle} icon={Newspaper} />
      <Card padded={false} style={styles.newsCard}>
        {news.length === 0 ? (
          <EmptyState compact icon={Newspaper} title={copy.noNews} />
        ) : (
          <>
            {news.map((a, i) => {
              const unread = !a.readBy.includes(user.id);
              return (
                <PressableScale
                  key={a.id}
                  scaleTo={0.99}
                  onPress={() => router.push(`/announcements/${a.id}`)}
                  accessibilityLabel={`${a.title}${unread ? copy.unreadSuffix : ''}`}
                  style={[styles.newsRow, i > 0 && styles.newsBorder]}
                >
                  <View style={[styles.newsDot, !unread && styles.newsDotRead]} />
                  <View style={styles.newsText}>
                    <AppText variant="bodyMedium" numberOfLines={2}>
                      {a.title}
                    </AppText>
                    <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
                      {`${(a.committeeId && committees[a.committeeId]?.shortName) || copy.generalAnnouncement} • ${formatRelative(a.createdAt)}`}
                    </AppText>
                  </View>
                  <ChevronLeft size={theme.sizes.icon.sm} color={theme.colors.textMuted} />
                </PressableScale>
              );
            })}
            <PressableScale onPress={() => router.push('/announcements')} accessibilityRole="link" style={styles.newsMore} hitSlop={8}>
              <AppText variant="captionMedium" color={theme.colors.accentStrong}>
                {copy.allNews}
              </AppText>
              <ChevronLeft size={theme.sizes.icon.xs} color={theme.colors.accentStrong} />
            </PressableScale>
          </>
        )}
      </Card>
    </View>
  );
}
