import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Video, XCircle } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { Meeting } from '@/features/meetings/types';
import { videoProvider } from '@/features/meetings/services/video';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatRelative } from '@/utils/format';
import { meetingDetailsCopy as copy } from './MeetingDetailsScreen.data';
import { CONF_ICON_GLYPH_SIZE, createStyles } from './MeetingDetailsScreen.styles';

type Props = {
  meeting: Meeting;
  live: boolean;
  scheduled: boolean;
  canStart: boolean;
  canManage: boolean;
  onStart: () => void;
  onEnd: () => void;
};

/** Online-meeting status card: live / not started / ended, with start and end-for-all actions. */
export function ConferenceCard({ meeting, live, scheduled, canStart, canManage, onStart, onEnd }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Card style={[styles.block, live && styles.liveCard]}>
      <View style={styles.confHead}>
        <View style={[styles.confIcon, live && styles.confIconLive]}>
          <Video size={CONF_ICON_GLYPH_SIZE} color={live ? theme.colors.white : theme.colors.primary} />
        </View>
        <View style={styles.fill}>
          <AppText variant="cardTitle">{live ? copy.conferenceLive : scheduled ? copy.conferenceScheduled : copy.conferenceEnded}</AppText>
          <AppText variant="meta" color={theme.colors.textSecondary}>
            {live && meeting.conference?.startedAt
              ? copy.conferenceStartedAt(formatRelative(meeting.conference.startedAt))
              : scheduled
                ? canStart
                  ? copy.conferenceStartHint
                  : copy.conferenceWaitHint
                : copy.conferenceReviewHint}
          </AppText>
        </View>
      </View>
      {canStart ? <Button title={copy.startMeeting} icon={Video} onPress={onStart} style={styles.startButton} /> : null}
      {live && canManage ? <Button title={copy.endForAll} icon={XCircle} variant="dangerOutline" size="sm" onPress={onEnd} style={styles.endButton} /> : null}
      {videoProvider.isSimulated ? (
        <AppText variant="meta" color={theme.colors.textMuted} style={styles.simulatedNotice}>
          {copy.simulatedNotice}
        </AppText>
      ) : null}
    </Card>
  );
}
