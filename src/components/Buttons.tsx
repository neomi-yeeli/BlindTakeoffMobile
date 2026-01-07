import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

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
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  primaryText: {
    color: '#04101a',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    gap: 6,
  },
  toggleItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleItemActive: {
    backgroundColor: colors.primaryAlt,
    borderColor: colors.primaryAlt,
  },
  toggleLabel: {
    color: colors.muted,
    fontWeight: '700',
  },
  toggleLabelActive: {
    color: '#04101a',
  },
});

