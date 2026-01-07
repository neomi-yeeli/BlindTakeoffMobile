import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { MissionSummary } from '../types';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { formatDuration, formatLocation, formatTime } from '../utils/format';

type Props = {
  summary: MissionSummary;
  onRestart: () => void;
};

export const MissionSummaryCard = ({ summary, onRestart }: Props) => (
  <View style={styles.card}>
    <Text style={styles.title}>Mission summary</Text>
    <Text style={styles.caption}>Operation complete. Review and close out.</Text>

    <View style={styles.row}>
      <Text style={styles.label}>Operation</Text>
      <Text style={styles.value}>{summary.operationType.toUpperCase()}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Duration</Text>
      <Text style={styles.value}>{formatDuration(summary.endTime - summary.startTime)}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Start</Text>
      <Text style={styles.value}>{formatTime(summary.startTime)}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>End</Text>
      <Text style={styles.value}>{formatTime(summary.endTime)}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>
        {formatLocation(summary.location.lat, summary.location.lon)}
        {summary.location.label ? ` (${summary.location.label})` : ''}
      </Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Drone size</Text>
      <Text style={styles.value}>
        {summary.droneSizeCm.width}cm × {summary.droneSizeCm.length}cm
      </Text>
    </View>

    <View style={styles.actions}>
      <PrimaryButton label="Complete mission" onPress={onRestart} />
      <SecondaryButton label="New operation" onPress={onRestart} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  caption: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.muted,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

