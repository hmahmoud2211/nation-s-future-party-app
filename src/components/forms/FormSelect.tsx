import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { borderRadius, colors, shadows, sizes, spacing } from '@/theme';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { SearchInput } from '@/components/forms/SearchInput';
import { EmptyState } from '@/components/feedback/States';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  /** Show an initials avatar with this color. */
  avatarColor?: string;
  disabled?: boolean;
}

interface BaseProps {
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  searchable?: boolean;
  error?: boolean;
  disabled?: boolean;
  emptyText?: string;
  allowClear?: boolean;
  /** `outline` (default form field) or `filled` — the slate selector bar from the dashboard design. */
  variant?: 'outline' | 'filled';
}

type SingleProps = BaseProps & { multiple?: false; value?: string; onChange: (value: string | undefined) => void };
type MultiProps = BaseProps & { multiple: true; value: string[]; onChange: (value: string[]) => void };

/** Dropdown implemented as a searchable bottom sheet (single or multi select). */
export function FormSelect(props: SingleProps | MultiProps) {
  const { options, placeholder = 'اختر…', title, error, disabled, emptyText = 'لا توجد خيارات متاحة', allowClear, variant = 'outline' } = props;
  const filled = variant === 'filled';
  const searchable = props.searchable ?? options.length > 6;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string[]>([]);

  const selectedValues = props.multiple ? props.value : props.value ? [props.value] : [];
  const selectedLabels = options.filter((o) => selectedValues.includes(o.value)).map((o) => o.label);
  const display = selectedLabels.length === 0 ? '' : props.multiple && selectedLabels.length > 2 ? `${selectedLabels.slice(0, 2).join('، ')} و${selectedLabels.length - 2} آخرين` : selectedLabels.join('، ');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    return options.filter((o) => o.label.includes(q) || o.description?.includes(q));
  }, [options, query]);

  const openSheet = () => {
    if (disabled) return;
    setQuery('');
    setDraft(selectedValues);
    setOpen(true);
  };

  const pick = (value: string) => {
    if (props.multiple) {
      setDraft((d) => (d.includes(value) ? d.filter((v) => v !== value) : [...d, value]));
    } else {
      props.onChange(value);
      setOpen(false);
    }
  };

  const current = props.multiple ? draft : selectedValues;

  return (
    <>
      {/* Trigger and clear button are siblings (no nested pressables / <button>s on web). */}
      <View style={[styles.trigger, filled && styles.filled, error && styles.error, disabled && styles.disabled]}>
        <PressableScale
          scaleTo={0.99}
          onPress={openSheet}
          disabled={disabled}
          accessibilityLabel={title ?? placeholder}
          style={styles.triggerPress}
        >
          <AppText variant={filled ? 'bodyMedium' : 'body'} color={filled ? colors.white : display ? colors.text : colors.placeholder} numberOfLines={1} style={{ flex: 1 }}>
            {display || placeholder}
          </AppText>
          <ChevronDown size={18} color={filled ? colors.accentLight : colors.textSecondary} />
        </PressableScale>
        {allowClear && display && !props.multiple ? (
          <PressableScale hitSlop={8} onPress={() => props.onChange(undefined)} accessibilityLabel="مسح الاختيار" style={styles.clear}>
            <X size={16} color={colors.textSecondary} />
          </PressableScale>
        ) : null}
      </View>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={title ?? placeholder}
        footer={
          props.multiple ? (
            <Button
              title={`تأكيد الاختيار${draft.length ? ` (${draft.length})` : ''}`}
              onPress={() => {
                props.onChange(draft);
                setOpen(false);
              }}
              fullWidth
            />
          ) : undefined
        }
      >
        {searchable ? <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث بالاسم…" style={{ marginBottom: spacing.md }} /> : null}
        {filtered.length === 0 ? (
          <EmptyState compact title={query ? 'لا توجد نتائج مطابقة' : emptyText} />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {filtered.map((o) => {
              const selected = current.includes(o.value);
              return (
                <PressableScale
                  key={o.value}
                  scaleTo={0.99}
                  disabled={o.disabled}
                  onPress={() => pick(o.value)}
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  {o.avatarColor ? <Avatar name={o.label} color={o.avatarColor} size={34} /> : null}
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium" numberOfLines={1}>
                      {o.label}
                    </AppText>
                    {o.description ? (
                      <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
                        {o.description}
                      </AppText>
                    ) : null}
                  </View>
                  <View style={[styles.check, selected && styles.checkOn, props.multiple && styles.checkSquare]}>
                    {selected ? <Check size={13} color={colors.white} strokeWidth={3} /> : null}
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.input,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filled: { minHeight: 44, borderRadius: borderRadius.sm, backgroundColor: colors.secondary, borderColor: colors.secondaryLight, ...shadows.tile },
  triggerPress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md },
  clear: { paddingHorizontal: spacing.md, minHeight: 48, justifyContent: 'center', borderStartWidth: 1, borderStartColor: colors.border },
  error: { borderColor: colors.error },
  disabled: { backgroundColor: colors.tint },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.tint },
  check: { width: 22, height: 22, borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkSquare: { borderRadius: borderRadius.xs },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});

export default FormSelect;
