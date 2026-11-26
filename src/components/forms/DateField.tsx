import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { borderRadius, colors, spacing } from '@/theme';
import { AR_MONTHS, formatDate, formatDateTime, isSameDay, localizeDigits } from '@/utils/format';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { PressableScale } from '@/components/common/PressableScale';

// Week starts on Saturday (common in Egypt).
const WEEK = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const MINUTES = [0, 15, 30, 45];

export interface DateFieldProps {
  value?: string;
  onChange: (iso: string | undefined) => void;
  placeholder?: string;
  withTime?: boolean;
  minDate?: Date;
  error?: boolean;
  title?: string;
  allowClear?: boolean;
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 1) % 7; // Saturday = 0
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const hourLabel = (h: number) => localizeDigits(`${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'م' : 'ص'}`);

/** Arabic calendar picker (custom, identical on iOS / Android / web). */
export function DateField({ value, onChange, placeholder = 'اختر التاريخ', withTime, minDate, error, title, allowClear }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(value) : new Date();
  const [cursor, setCursor] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const [picked, setPicked] = useState<Date>(initial);
  const [hour, setHour] = useState(value ? initial.getHours() : 18);
  const [minute, setMinute] = useState(value ? Math.floor(initial.getMinutes() / 15) * 15 : 0);

  const cells = useMemo(() => buildMonth(cursor.y, cursor.m), [cursor]);
  const today = new Date();
  const min = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined;

  const openSheet = () => {
    const d = value ? new Date(value) : new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setPicked(d);
    setHour(value ? d.getHours() : 18);
    setMinute(value ? Math.floor(d.getMinutes() / 15) * 15 : 0);
    setOpen(true);
  };

  const shift = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const confirm = () => {
    const d = new Date(picked);
    if (withTime) d.setHours(hour, minute, 0, 0);
    else d.setHours(12, 0, 0, 0);
    onChange(d.toISOString());
    setOpen(false);
  };

  return (
    <>
      {/* Trigger and clear button are siblings (no nested pressables / <button>s on web). */}
      <View style={[styles.trigger, error && { borderColor: colors.error }]}>
        <PressableScale scaleTo={0.99} onPress={openSheet} accessibilityLabel={title ?? placeholder} style={styles.triggerPress}>
          <CalendarDays size={18} color={colors.textSecondary} />
          <AppText variant="body" color={value ? colors.text : colors.textMuted} style={{ flex: 1 }} numberOfLines={1}>
            {value ? (withTime ? formatDateTime(value) : formatDate(value)) : placeholder}
          </AppText>
        </PressableScale>
        {allowClear && value ? (
          <PressableScale hitSlop={8} onPress={() => onChange(undefined)} accessibilityLabel="مسح التاريخ" style={styles.clear}>
            <AppText variant="meta" color={colors.textSecondary}>
              مسح
            </AppText>
          </PressableScale>
        ) : null}
      </View>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={title ?? placeholder} footer={<Button title="تأكيد" onPress={confirm} fullWidth />}>
        <View style={styles.monthRow}>
          {/* RTL: previous month on the start (right) side */}
          <PressableScale onPress={() => shift(-1)} style={styles.nav} accessibilityLabel="الشهر السابق">
            <ChevronRight size={20} color={colors.primary} />
          </PressableScale>
          <AppText variant="sectionTitle">{localizeDigits(`${AR_MONTHS[cursor.m]} ${cursor.y}`)}</AppText>
          <PressableScale onPress={() => shift(1)} style={styles.nav} accessibilityLabel="الشهر التالي">
            <ChevronLeft size={20} color={colors.primary} />
          </PressableScale>
        </View>
        <View style={styles.grid}>
          {WEEK.map((w) => (
            <View key={w} style={styles.cell}>
              <AppText variant="meta" color={colors.textSecondary}>
                {w}
              </AppText>
            </View>
          ))}
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={styles.cell} />;
            const disabled = !!min && d < min;
            const selected = isSameDay(d, picked);
            const isToday = isSameDay(d, today);
            return (
              <View key={d.toISOString()} style={styles.cell}>
                <PressableScale
                  disabled={disabled}
                  onPress={() => setPicked(d)}
                  style={[styles.day, isToday && styles.today, selected && styles.selected]}
                  accessibilityLabel={formatDate(d)}
                >
                  <AppText variant="bodyMedium" color={selected ? colors.white : disabled ? colors.textMuted : colors.text}>
                    {d.getDate()}
                  </AppText>
                </PressableScale>
              </View>
            );
          })}
        </View>

        {withTime ? (
          <View style={{ marginTop: spacing.lg }}>
            <View style={styles.timeTitle}>
              <Clock size={16} color={colors.accentStrong} />
              <AppText variant="label">الوقت</AppText>
            </View>
            <View style={styles.chips}>
              {HOURS.map((h) => (
                <PressableScale key={h} onPress={() => setHour(h)} style={[styles.chip, hour === h && styles.chipOn]}>
                  <AppText variant="captionMedium" color={hour === h ? colors.white : colors.text}>
                    {hourLabel(h)}
                  </AppText>
                </PressableScale>
              ))}
            </View>
            <View style={[styles.chips, { marginTop: spacing.sm }]}>
              {MINUTES.map((m) => (
                <PressableScale key={m} onPress={() => setMinute(m)} style={[styles.chip, minute === m && styles.chipOn]}>
                  <AppText variant="captionMedium" color={minute === m ? colors.white : colors.text}>
                    {localizeDigits(`:${m.toString().padStart(2, '0')}`)}
                  </AppText>
                </PressableScale>
              ))}
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.frostStrong,
  },
  triggerPress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md },
  clear: { paddingHorizontal: spacing.md, minHeight: 48, justifyContent: 'center', borderStartWidth: 1, borderStartColor: colors.border },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  nav: { width: 38, height: 38, borderRadius: borderRadius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.frostStrong, borderRadius: borderRadius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxs },
  day: { width: '100%', height: '100%', borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.accent },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  chip: { paddingHorizontal: spacing.md, height: 34, borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.frostStrong, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});

export default DateField;
