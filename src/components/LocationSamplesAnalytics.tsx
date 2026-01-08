import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, radius, spacing } from '../theme';
import { LocationSample } from '../types';

type Props = {
  samples: LocationSample[];
};

const chartWidth = Dimensions.get('window').width - spacing.xl * 2;

const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const LocationSamplesAnalytics = ({ samples }: Props) => {
  const computed = useMemo(() => {
    if (samples.length === 0) {
      return {
        labels: [] as string[],
        altitude: [] as number[],
        cumulative: [] as number[],
        displacement: [] as number[],
      };
    }

    const labels: string[] = [];
    const altitude: number[] = [];
    const cumulative: number[] = [];
    const displacement: number[] = [];

    let total = 0;
    const start = samples[0];

    samples.forEach((s, idx) => {
      altitude.push(s.altitude);
      if (idx === 0) {
        cumulative.push(0);
        displacement.push(0);
      } else {
        const prev = samples[idx - 1];
        const step = haversineMeters(prev.lat, prev.lon, s.lat, s.lon);
        total += step;
        cumulative.push(total);
        const disp = haversineMeters(start.lat, start.lon, s.lat, s.lon);
        displacement.push(disp);
      }
      labels.push(`${idx + 1}`);
    });

    const maxLabels = 6;
    const step = Math.max(1, Math.floor(labels.length / maxLabels));
    const sparseLabels = labels.map((l, idx) => (idx % step === 0 ? l : ''));

    return { labels: sparseLabels, altitude, cumulative, displacement };
  }, [samples]);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.muted,
    propsForDots: { r: '3', strokeWidth: '1', stroke: colors.accent },
    propsForLabels: { fontSize: 10 },
  };

  if (samples.length === 0) {
    return <Text style={styles.empty}>אין דגימות להצגה</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>גרפים</Text>

      <Text style={styles.chartLabel}>גובה (מטרים)</Text>
      <LineChart
        data={{
          labels: computed.labels,
          datasets: [{ data: computed.altitude, color: () => colors.primary, strokeWidth: 2 }],
        }}
        width={chartWidth}
        height={220}
        withShadow={false}
        withInnerLines
        withOuterLines
        chartConfig={chartConfig}
        bezier
        formatYLabel={(v: string) => `${Math.round(Number(v))}`}
        style={styles.chart}
      />

      <Text style={styles.chartLabel}>מרחק מצטבר (מ')</Text>
      <LineChart
        data={{
          labels: computed.labels,
          datasets: [{ data: computed.cumulative, color: () => colors.accent, strokeWidth: 2 }],
        }}
        width={chartWidth}
        height={220}
        withShadow={false}
        withInnerLines
        withOuterLines
        chartConfig={{
          ...chartConfig,
          color: () => colors.accent,
        }}
        formatYLabel={(v: string) => `${Math.round(Number(v))}`}
        style={styles.chart}
      />

      <Text style={styles.chartLabel}>תזוזה מהנקודת פתיחה (מ')</Text>
      <LineChart
        data={{
          labels: computed.labels,
          datasets: [{ data: computed.displacement, color: () => colors.primaryAlt, strokeWidth: 2 }],
        }}
        width={chartWidth}
        height={220}
        withShadow={false}
        withInnerLines
        withOuterLines
        chartConfig={{
          ...chartConfig,
          color: () => colors.primaryAlt,
        }}
        formatYLabel={(v: string) => `${Math.round(Number(v))}`}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  chartLabel: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  chart: {
    borderRadius: radius.lg,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    writingDirection: 'rtl',
  },
});

