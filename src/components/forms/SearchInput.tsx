import React from 'react';
import { Platform, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { borderRadius, colors, MAX_FONT_SCALE, spacing, typography } from '@/theme';
import { PressableScale } from '@/components/common/PressableScale';

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'بحث…',
  style,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Search size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <PressableScale onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="مسح البحث">
          <X size={16} color={colors.textSecondary} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.frostStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: typography.inputCompact.fontFamily,
    fontSize: typography.inputCompact.fontSize,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
});

export default SearchInput;
