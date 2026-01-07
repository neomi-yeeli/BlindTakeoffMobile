import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { MissionSummary } from '../types';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { formatDuration, formatLocation, formatTime } from '../utils/format';

type Props = {
  summary: MissionSummary;
  onRestart: () => void;
};

export const MissionSummaryCard = ({ summary, onRestart }: Props) => (
  <ScrollView>
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

      {/* Samples section */}
      <View style={styles.samplesSection}>
        <Text style={styles.sectionTitle}>Location & Altitude Samples ({summary.samples.length})</Text>
        <Text style={styles.sectionCaption}>Data collected during the operation</Text>
        
        {summary.samples.length === 0 ? (
          <Text style={styles.noSamples}>No samples available</Text>
        ) : (
          <View style={styles.samplesContainer}>
            {summary.samples.map((sample, index) => (
              <View key={index} style={styles.sampleCard}>
                <View style={styles.sampleHeader}>
                  <Text style={styles.sampleIndex}>#{index + 1}</Text>
                  <Text style={styles.sampleTime}>{formatTime(sample.timestamp)}</Text>
                </View>
                <View style={styles.sampleRow}>
                  <Text style={styles.sampleLabel}>Location:</Text>
                  <Text style={styles.sampleValue}>{formatLocation(sample.lat, sample.lon)}</Text>
                </View>
                <View style={styles.sampleRow}>
                  <Text style={styles.sampleLabel}>Altitude:</Text>
                  <Text style={styles.sampleValue}>{sample.altitude.toFixed(1)}m</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Complete mission" onPress={onRestart} />
        <SecondaryButton label="New operation" onPress={onRestart} />
      </View>
    </View>
  </ScrollView>
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
  samplesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  sectionCaption: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
  noSamples: {
    color: colors.muted,
    textAlign: 'center',
    padding: spacing.lg,
    fontStyle: 'italic',
  },
  samplesContainer: {
    gap: spacing.sm,
  },
  sampleCard: {
    backgroundColor: '#0f172a',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sampleIndex: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  sampleTime: {
    color: colors.muted,
    fontSize: 12,
  },
  sampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sampleLabel: {
    color: colors.muted,
    fontWeight: '600',
  },
  sampleValue: {
    color: colors.text,
    fontWeight: '700',
  },
});

