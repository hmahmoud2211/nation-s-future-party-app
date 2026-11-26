import React, { useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarSync,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  ChevronLeft,
  FilePenLine,
  Lightbulb,
  MapPin,
  Newspaper,
  Phone,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge, CountPill } from '@/components/common/Badge';
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
import type { Tone } from '@/theme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { formatNumber, formatPercent, formatPhone, formatRelative, formatShortDate, formatTime, formatWeekday } from '@/utils/format';
import { homeCopy as copy } from './HomeScreen.data';
import { COMPACT_TILE_SIZE, CONTACT_AVATAR_SIZE, createStyles, GOVERNORATE_RING_SIZE, MEETING_ACCENT_WIDTH, RATING_BAR_HEIGHT } from './HomeScreen.styles';

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

type MeetingKind = 'previous' | 'next';

/** Relative-time chip on the end of a meeting card ("live now", "in 2 days", "6 days ago"). */
function meetingStatus(kind: MeetingKind, meeting: Meeting): { label: string; tone: Tone; live: boolean } {
  if (meeting.status === 'live') return { label: copy.liveNow, tone: 'success', live: true };
  return { label: formatRelative(meeting.date), tone: kind === 'next' ? 'accent' : 'neutral', live: false };
}

/** Previous / next meeting: label, title, day · date · time and a relative-time chip. */
function MeetingHighlightCard({ kind, icon, meeting, style }: { kind: MeetingKind; icon: LucideIcon; meeting?: Meeting; style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { theme, styles } = useStyles();
  const { isNarrow: compact } = useScreenLayout();
  const label = kind === 'previous' ? copy.previousMeeting : copy.nextMeeting;
  const when = meeting ? copy.meetingWhen(formatWeekday(meeting.date), formatShortDate(meeting.date)) : '';
  const time = meeting ? formatTime(meeting.date) : '';
  const status = meeting ? meetingStatus(kind, meeting) : null;
  return (
    <Card
      onPress={() => (meeting ? router.push(`/meetings/${meeting.id}`) : router.navigate('/meetings'))}
      accessibilityLabel={meeting && status ? copy.meetingA11y(label, meeting.title, when, time, status.label) : copy.meetingA11yNone(label)}
      accessibilityHint={meeting ? copy.openMeetingHint : copy.openMeetingsHint}
      accentColor={theme.colors.primaryDark}
      accentPosition="end"
      accentWidth={MEETING_ACCENT_WIDTH}
      padded={false}
      style={[styles.meetingCard, style]}
    >
      <IconTile icon={icon} size={compact ? COMPACT_TILE_SIZE : undefined} />
      <View style={styles.meetingBody}>
        <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
          {label}
        </AppText>
        {meeting ? (
          <>
            <AppText variant="cardTitle" numberOfLines={1}>
              {meeting.title}
            </AppText>
            <View style={styles.meetingMeta}>
              <CalendarDays size={theme.sizes.icon.xs} color={theme.colors.textSecondary} />
              <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1} style={styles.meetingMetaText}>
                {when}
              </AppText>
              <View style={styles.meetingMetaDot} />
              <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
                {time}
              </AppText>
            </View>
          </>
        ) : (
          <AppText variant="cardTitle" color={theme.colors.textMuted} numberOfLines={1}>
            {kind === 'previous' ? copy.noPreviousMeeting : copy.noNextMeeting}
          </AppText>
        )}
      </View>
      {status ? <Badge label={status.label} tone={status.tone} dot={status.live} style={styles.meetingStatus} /> : null}
    </Card>
  );
}

export function PartyPerformanceSection({ previous, next }: { previous?: Meeting; next?: Meeting }) {
  const { styles } = useStyles();
  return (
    <View>
      <SectionHeader title={copy.performanceTitle} icon={ChartNoAxesCombined} />
      <MeetingHighlightCard kind="previous" icon={CalendarClock} meeting={previous} />
      <MeetingHighlightCard kind="next" icon={CalendarSync} meeting={next} style={styles.meetingGap} />
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
  const { theme, styles } = useStyles();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <View style={styles.section}>
      <SectionHeader title={copy.implementedTitle} icon={ChartColumnIncreasing} />
      <Card style={styles.chartCard}>
        <View style={styles.chartHead}>
          <AppText variant="display" color={theme.colors.primary}>
            {formatNumber(total)}
          </AppText>
          <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={2} style={styles.chartCaption}>
            {copy.implementedSummary(data.length)}
          </AppText>
        </View>
        <TrendChart data={data} highlightLast accessibilityLabel={copy.implementedA11y(data)} />
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

/** Governorate secretary: initials avatar, role over name, and the contact number as a pill on the end. */
function SecretaryRow({ contact }: { contact?: GovernorateContact }) {
  const { theme, styles } = useStyles();
  const phone = contact ? formatPhone(contact.phone) : '';
  return (
    <View style={styles.contact} accessible accessibilityLabel={contact ? copy.secretaryA11y(contact.name, phone) : copy.noSecretary}>
      {contact ? (
        <Avatar name={contact.name} size={CONTACT_AVATAR_SIZE} color={theme.colors.primary} />
      ) : (
        <View style={styles.contactAvatarEmpty}>
          <UserRound size={theme.sizes.icon.md} color={theme.colors.textMuted} />
        </View>
      )}
      <View style={styles.contactText}>
        <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
          {copy.governorateSecretary}
        </AppText>
        <AppText variant="cardTitle" color={contact ? theme.colors.text : theme.colors.textMuted} numberOfLines={1}>
          {contact?.name ?? copy.noSecretary}
        </AppText>
      </View>
      {contact ? <Badge label={phone} tone="accent" icon={Phone} size="md" /> : null}
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
        <SecretaryRow contact={secretary} />
        <GradientDivider />
        <View style={styles.govCountHead}>
          <AppText variant="subheading" style={styles.medium} numberOfLines={1}>
            {copy.initiativesCount}
          </AppText>
          <Badge label={copy.initiativesTotal(breakdown.total)} />
        </View>
        <StatRings items={ringItems(breakdown)} total={breakdown.total} size={GOVERNORATE_RING_SIZE} />
        <View style={styles.rating}>
          <View style={styles.ratingHead}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {copy.rating}
            </AppText>
            <AppText variant="subheading" color={theme.colors.primary}>
              {formatPercent(rate)}
            </AppText>
          </View>
          <ProgressBar
            value={rate}
            gradient={theme.gradients.progress}
            fillFrom="end"
            trackColor={theme.colors.divider}
            height={RATING_BAR_HEIGHT}
            accessibilityLabel={copy.ratingA11y(current.name, rate)}
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
