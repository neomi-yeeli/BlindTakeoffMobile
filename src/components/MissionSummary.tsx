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
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.card}>
      <Text style={styles.title}>סיכום משימה</Text>
      <Text style={styles.caption}>הפעולה הסתיימה. סקירה וסגירה.</Text>

      <View style={styles.row}>
        <Text style={styles.label}>סוג פעולה</Text>
        <Text style={styles.value}>{summary.operationType === 'takeoff' ? 'המראה' : 'נחיתה'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>משך הפעולה</Text>
        <Text style={styles.value}>{formatDuration(summary.endTime - summary.startTime)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>שעת התחלה</Text>
        <Text style={styles.value}>{formatTime(summary.startTime)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>שעת סיום</Text>
        <Text style={styles.value}>{formatTime(summary.endTime)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>מיקום</Text>
        <Text style={styles.value}>
          {formatLocation(summary.location.lat, summary.location.lon)}
          {summary.location.label ? ` (${summary.location.label})` : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>גודל רחפן</Text>
        <Text style={styles.value}>
          {summary.droneSizeCm.width}×{summary.droneSizeCm.length} ס"מ
        </Text>
      </View>

      <View style={styles.samplesSection}>
        <Text style={styles.sectionTitle}>דגימות מיקום/גובה ({summary.samples.length})</Text>
        <Text style={styles.sectionCaption}>נתוני טיסה שנאספו</Text>

        {summary.samples.length === 0 ? (
          <Text style={styles.noSamples}>אין דגימות זמינות</Text>
        ) : (
          <View style={styles.samplesContainer}>
            {summary.samples.map((sample, index) => (
              <View key={index} style={styles.sampleCard}>
                <View style={styles.sampleHeader}>
                  <Text style={styles.sampleIndex}>#{index + 1}</Text>
                  <Text style={styles.sampleTime}>{formatTime(sample.timestamp)}</Text>
                </View>
                <View style={styles.sampleRow}>
                  <Text style={styles.sampleLabel}>מיקום:</Text>
                  <Text style={styles.sampleValue}>{formatLocation(sample.lat, sample.lon)}</Text>
                </View>
                <View style={styles.sampleRow}>
                  <Text style={styles.sampleLabel}>גובה:</Text>
                  <Text style={styles.sampleValue}>{sample.altitude.toFixed(1)} מ'</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label=" חזרה לדף הבית" onPress={onRestart} />
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 1.5,
  },
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
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  caption: {
    color: colors.muted,
    marginBottom: spacing.md,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.muted,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  value: {
    color: colors.text,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    direction: 'rtl',
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

