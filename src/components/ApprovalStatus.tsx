import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  status: 'pending' | 'approved';
};

export const ApprovalStatus = ({ status }: Props) => {
  const progress = useRef(new Animated.Value(status === 'approved' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: status === 'approved' ? 1 : 0.4,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, status]);

  const widthInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['40%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flight Request</Text>
      <Text style={styles.subtitle}>
        {status === 'pending' ? 'Awaiting approval...' : 'Approved. Preparing camera.'}
      </Text>

      <View style={styles.bar}>
        <Animated.View style={[styles.barFill, { width: widthInterpolation }]} />
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, status === 'pending' ? styles.badgeActive : styles.badgeDim]}>
          <Text style={styles.badgeText}>Pending</Text>
        </View>
        <View style={[styles.badge, status === 'approved' ? styles.badgeActive : styles.badgeDim]}>
          <Text style={styles.badgeText}>Approved</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
  },
  bar: {
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  badgeActive: {
    backgroundColor: colors.primaryAlt,
  },
  badgeDim: {
    backgroundColor: '#0f172a',
  },
  badgeText: {
    color: colors.text,
    fontWeight: '700',
  },
});

