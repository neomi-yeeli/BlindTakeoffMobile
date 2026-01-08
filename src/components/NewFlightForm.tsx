import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { colors, radius, spacing } from '../theme';
import { FlightRequest, OperationType } from '../types';
import { PrimaryButton, SecondaryButton, PillToggle } from './Buttons';

type Props = {
  onSubmit: (request: FlightRequest) => void;
  onCancel?: () => void;
};

type ValidationErrors = Partial<Record<'lat' | 'lon' | 'width' | 'length' | 'timer', string>>;

export const NewFlightForm = ({ onSubmit, onCancel }: Props) => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('30');
  const [operationType, setOperationType] = useState<OperationType>('takeoff');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [busy, setBusy] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | undefined>();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const validation = useMemo(() => {
    const newErrors: ValidationErrors = {};
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const parsedWidth = parseFloat(width);
    const parsedLength = parseFloat(length);
    const parsedMinutes = parseInt(minutes, 10);
    const parsedSeconds = parseInt(seconds, 10);
    const totalMs = (Number.isFinite(parsedMinutes) ? parsedMinutes : 0) * 60_000 + (Number.isFinite(parsedSeconds) ? parsedSeconds : 0) * 1000;

    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      newErrors.lat = 'יש להזין קו רוחב תקין';
    }
    if (!Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      newErrors.lon = 'יש להזין קו אורך תקין';
    }
    if (!Number.isFinite(parsedWidth) || parsedWidth <= 0) {
      newErrors.width = 'יש להזין רוחב חיובי';
    }
    if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
      newErrors.length = 'יש להזין אורך חיובי';
    }
    if (!Number.isFinite(parsedMinutes) || !Number.isFinite(parsedSeconds) || totalMs <= 0) {
      newErrors.timer = 'יש להזין זמן תקין';
    }

    return { newErrors, parsedLat, parsedLon, parsedWidth, parsedLength, totalMs };
  }, [lat, length, lon, minutes, seconds, width]);

  const handleSubmit = () => {
    const { newErrors, parsedLat, parsedLon, parsedWidth, parsedLength, totalMs } = validation;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    onSubmit({
      lat: parsedLat,
      lon: parsedLon,
      widthCm: parsedWidth,
      lengthCm: parsedLength,
      operationType,
      locationLabel,
      createdAt: Date.now(),
      timerMs: totalMs,
    });
  };

  const fillCurrentLocation = async () => {
    try {
      setBusy(true);
      const permissions = await Location.requestForegroundPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert('Permission needed', 'Location permission is required to use your current GPS point.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLat(position.coords.latitude.toFixed(6));
      setLon(position.coords.longitude.toFixed(6));
      setLocationLabel('Current GPS');
    } catch (error) {
      Alert.alert('Unable to fetch location', 'Please check GPS and try again.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.title}>בקשת המראה / נחיתה</Text>
        <Text style={styles.subtitle}>מלא את הפרטים ונתחיל בהזרמה החיה</Text>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>מיקום - קו רוחב (Latitude)</Text>
            <TextInput
              placeholder="לדוגמה 32.08"
              placeholderTextColor={colors.muted}
              value={lat}
              onChangeText={(v) => {
                setLat(v);
                if (errors.lat) setErrors((prev) => ({ ...prev, lat: undefined }));
              }}
              keyboardType="decimal-pad"
              style={[styles.input, errors.lat && styles.inputError]}
            />
            {errors.lat ? <Text style={styles.error}>{errors.lat}</Text> : null}
          </View>
          <View style={styles.spacer} />
          <View style={styles.field}>
            <Text style={styles.label}>מיקום - קו אורך (Longitude)</Text>
            <TextInput
              placeholder="לדוגמה 34.80"
              placeholderTextColor={colors.muted}
              value={lon}
              onChangeText={(v) => {
                setLon(v);
                if (errors.lon) setErrors((prev) => ({ ...prev, lon: undefined }));
              }}
              keyboardType="decimal-pad"
              style={[styles.input, errors.lon && styles.inputError]}
            />
            {errors.lon ? <Text style={styles.error}>{errors.lon}</Text> : null}
          </View>
        </View>

        <SecondaryButton label="שימוש במיקום נוכחי" onPress={fillCurrentLocation} disabled={busy} style={styles.fullButton} />

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>רוחב רחפן (ס"מ)</Text>
            <TextInput
              placeholder="לדוגמה 45"
              placeholderTextColor={colors.muted}
              value={width}
              onChangeText={(v) => {
                setWidth(v);
                if (errors.width) setErrors((prev) => ({ ...prev, width: undefined }));
              }}
              keyboardType="numeric"
              style={[styles.input, errors.width && styles.inputError]}
            />
            {errors.width ? <Text style={styles.error}>{errors.width}</Text> : null}
          </View>
          <View style={styles.spacer} />
          <View style={styles.field}>
            <Text style={styles.label}>אורך רחפן (ס"מ)</Text>
            <TextInput
              placeholder="לדוגמה 40"
              placeholderTextColor={colors.muted}
              value={length}
              onChangeText={(v) => {
                setLength(v);
                if (errors.length) setErrors((prev) => ({ ...prev, length: undefined }));
              }}
              keyboardType="numeric"
              style={[styles.input, errors.length && styles.inputError]}
            />
            {errors.length ? <Text style={styles.error}>{errors.length}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>סוג פעולה</Text>
        <PillToggle
          value={operationType}
          onChange={setOperationType}
          options={[
            { label: 'המראה', value: 'takeoff' },
            { label: 'נחיתה', value: 'landing' },
          ]}
        />

        <Text style={styles.label}>טיימר עד תחילת פעולה</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.subLabel}>דקות</Text>
            <TextInput
              placeholder="00"
              placeholderTextColor={colors.muted}
              value={minutes}
              onChangeText={(v) => {
                const val = v.replace(/[^0-9]/g, '');
                setMinutes(val);
                if (errors.timer) setErrors((prev) => ({ ...prev, timer: undefined }));
              }}
              keyboardType="number-pad"
              style={[styles.input, errors.timer && styles.inputError]}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.field}>
            <Text style={styles.subLabel}>שניות</Text>
            <TextInput
              placeholder="30"
              placeholderTextColor={colors.muted}
              value={seconds}
              onChangeText={(v) => {
                const val = v.replace(/[^0-9]/g, '');
                setSeconds(val);
                if (errors.timer) setErrors((prev) => ({ ...prev, timer: undefined }));
              }}
              keyboardType="number-pad"
              style={[styles.input, errors.timer && styles.inputError]}
            />
          </View>
        </View>
        {errors.timer ? <Text style={styles.error}>{errors.timer}</Text> : null}

          <View style={styles.actionsRow}>
            <PrimaryButton label="שליחת בקשה" onPress={handleSubmit} disabled={busy} style={styles.submitBtn} />
            {onCancel ? (
              <SecondaryButton
                label="ביטול בקשה חדשה"
                onPress={onCancel}
                disabled={busy}
                style={styles.cancelBtn}
              />
            ) : null}
          </View>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xs,
    gap: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.sm,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  helper: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  label: {
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 6,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subLabel: {
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 6,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  spacer: {
    width: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cancelBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  fullButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
});

