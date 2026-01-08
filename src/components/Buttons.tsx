import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
};

export const PrimaryButton = ({ label, onPress, disabled, style }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.base,
      styles.primary,
      pressed && styles.pressed,
      disabled && styles.disabled,
      style,
    ]}
  >
    <Text style={styles.primaryText}>{label}</Text>
  </Pressable>
);

export const SecondaryButton = ({ label, onPress, disabled, style }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.base,
      styles.secondary,
      pressed && styles.pressed,
      disabled && styles.disabled,
      style,
    ]}
  >
    <Text style={styles.secondaryText}>{label}</Text>
  </Pressable>
);

type PillToggleProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

export const PillToggle = <T extends string>({ options, value, onChange }: PillToggleProps<T>) => (
  <Pressable style={styles.toggleRow}>
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          onPress={() => onChange(option.value)}
          style={[styles.toggleItem, active && styles.toggleItemActive]}
        >
          <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
    ...shadow.card,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: '#0f172a',
    ...shadow.card,
  },
  primaryText: {
    color: '#04101a',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: radius.lg,
    padding: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  toggleItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadow.card,
  },
  toggleItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  toggleLabel: {
    color: colors.muted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleLabelActive: {
    color: '#04101a',
    fontWeight: '800',
  },
});

