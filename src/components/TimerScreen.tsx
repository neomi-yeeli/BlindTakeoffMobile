import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatCountdown } from '../utils/format';
import { PrimaryButton, SecondaryButton } from './Buttons';

type Props = {
  remainingMs: number;
  totalMs: number;
  onEditTimer: (ms: number) => void;
  onLaunchNow: () => void;
};

export const TimerScreen = ({ remainingMs, totalMs, onEditTimer, onLaunchNow }: Props) => {
  const [editing, setEditing] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ratio = totalMs > 0 ? remainingMs / totalMs : 0;
    Animated.timing(progress, {
      toValue: ratio,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, remainingMs, totalMs]);

  const circumference = 240;
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circumference],
  });

  const formatted = formatCountdown(remainingMs);

  const handleSave = () => {
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    const ms = m * 60_000 + s * 1000;
    onEditTimer(ms);
    setEditing(false);
  };

  const currentTotal = useMemo(() => totalMs || remainingMs, [remainingMs, totalMs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>טיימר לפני המראה / נחיתה</Text>
      <Text style={styles.subtitle}>עוד רגע עוברים למצלמה. אפשר לערוך או להפעיל מיד.</Text>

      <View style={styles.circleWrapper}>
        <View style={styles.circleBase}>
          <Animated.View
            style={[
              styles.circleFill,
              {
                strokeDashoffset,
              },
            ]}
          />
          <Text style={styles.timerText}>{formatted}</Text>
          <Text style={styles.timerHint}>hh:mm</Text>
        </View>
      </View>

      {editing ? (
        <View style={styles.editRow}>
          <View style={styles.field}>
            <Text style={styles.label}>דקות</Text>
            <TextInput
              placeholder="00"
              placeholderTextColor={colors.muted}
              value={minutes}
              onChangeText={(v) => setMinutes(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>שניות</Text>
            <TextInput
              placeholder="30"
              placeholderTextColor={colors.muted}
              value={seconds}
              onChangeText={(v) => setSeconds(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <PrimaryButton label="שמור" onPress={handleSave} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label="הפעל עכשיו" onPress={onLaunchNow} />
        <SecondaryButton label={editing ? 'ביטול עריכה' : 'עריכת טיימר'} onPress={() => setEditing((p) => !p)} />
      </View>

      <Text style={styles.meta}>
        זמן מקורי: {formatCountdown(currentTotal)} · זמן נותר: {formatted}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'center',
    width: '100%',
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  circleBase: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  circleFill: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: colors.primary,
    borderStyle: 'solid',
    transform: [{ rotate: '-90deg' }],
  },
  timerText: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
  },
  timerHint: {
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  meta: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'center',
    width: '100%',
  },
  editRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'flex-end',
    width: '100%',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
  },
  label: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 18,
    textAlign: 'right',
  },
});

