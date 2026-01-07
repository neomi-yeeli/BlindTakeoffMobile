import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { colors, radius, spacing } from '../theme';
import { FlightRequest, OperationType } from '../types';
import { PrimaryButton, SecondaryButton, PillToggle } from './Buttons';

type Props = {
  onSubmit: (request: FlightRequest) => void;
};

type ValidationErrors = Partial<Record<'lat' | 'lon' | 'width' | 'length', string>>;

export const NewFlightForm = ({ onSubmit }: Props) => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('takeoff');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [busy, setBusy] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | undefined>();

  const validation = useMemo(() => {
    const newErrors: ValidationErrors = {};
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const parsedWidth = parseFloat(width);
    const parsedLength = parseFloat(length);

    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      newErrors.lat = 'Latitude must be between -90 and 90';
    }
    if (!Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      newErrors.lon = 'Longitude must be between -180 and 180';
    }
    if (!Number.isFinite(parsedWidth) || parsedWidth <= 0) {
      newErrors.width = 'Width must be a positive number';
    }
    if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
      newErrors.length = 'Length must be a positive number';
    }

    return { newErrors, parsedLat, parsedLon, parsedWidth, parsedLength };
  }, [lat, length, lon, width]);

  const handleSubmit = () => {
    const { newErrors, parsedLat, parsedLon, parsedWidth, parsedLength } = validation;
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>New Flight</Text>
        <Text style={styles.subtitle}>Submit a takeoff / landing request</Text>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              placeholder="e.g. 37.7749"
              placeholderTextColor={colors.muted}
              value={lat}
              onChangeText={setLat}
              keyboardType="decimal-pad"
              style={[styles.input, errors.lat && styles.inputError]}
            />
            {errors.lat ? <Text style={styles.error}>{errors.lat}</Text> : null}
          </View>
          <View style={styles.spacer} />
          <View style={styles.field}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              placeholder="-122.4194"
              placeholderTextColor={colors.muted}
              value={lon}
              onChangeText={setLon}
              keyboardType="decimal-pad"
              style={[styles.input, errors.lon && styles.inputError]}
            />
            {errors.lon ? <Text style={styles.error}>{errors.lon}</Text> : null}
          </View>
        </View>

        <SecondaryButton label="Use current GPS" onPress={fillCurrentLocation} disabled={busy} style={styles.fullButton} />

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Drone width (cm)</Text>
            <TextInput
              placeholder="Width"
              placeholderTextColor={colors.muted}
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
              style={[styles.input, errors.width && styles.inputError]}
            />
            {errors.width ? <Text style={styles.error}>{errors.width}</Text> : null}
          </View>
          <View style={styles.spacer} />
          <View style={styles.field}>
            <Text style={styles.label}>Drone length (cm)</Text>
            <TextInput
              placeholder="Length"
              placeholderTextColor={colors.muted}
              value={length}
              onChangeText={setLength}
              keyboardType="numeric"
              style={[styles.input, errors.length && styles.inputError]}
            />
            {errors.length ? <Text style={styles.error}>{errors.length}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>Operation type</Text>
        <PillToggle
          value={operationType}
          onChange={setOperationType}
          options={[
            { label: 'Takeoff', value: 'takeoff' },
            { label: 'Landing', value: 'landing' },
          ]}
        />

        <PrimaryButton label="Submit request" onPress={handleSubmit} disabled={busy} style={styles.submit} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
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
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
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
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xs,
  },
  spacer: {
    width: spacing.md,
  },
  submit: {
    marginTop: spacing.md,
  },
  fullButton: {
    marginBottom: spacing.md,
  },
});

