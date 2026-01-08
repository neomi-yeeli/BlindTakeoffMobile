import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { LocationSample } from '../types';
import { formatLocation, formatTime } from '../utils/format';

type Props = {
  samples: LocationSample[];
};

export const SamplesList = ({ samples }: Props) => {
  if (!samples.length) {
    return <Text style={styles.noSamples}>אין דגימות זמינות</Text>;
  }

  return (
    <View style={styles.container}>
      {samples.map((sample, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.index}>#{index + 1}</Text>
            <Text style={styles.time}>{formatTime(sample.timestamp)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>מיקום:</Text>
            <Text style={styles.value}>{formatLocation(sample.lat, sample.lon)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>גובה:</Text>
            <Text style={styles.value}>{sample.altitude.toFixed(1)} מ'</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    direction: 'rtl',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  index: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  time: {
    color: colors.muted,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.muted,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontWeight: '700',
  },
  noSamples: {
    color: colors.muted,
    textAlign: 'center',
    padding: spacing.lg,
    fontStyle: 'italic',
  },
});

