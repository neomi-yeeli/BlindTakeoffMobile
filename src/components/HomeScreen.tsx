import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './Buttons';
import { LogoSvg } from './LogoSvg';

type Props = {
  onStart: () => void;
};

export const HomeScreen = ({ onStart }: Props) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={styles.logoWrap}>
          <LogoSvg size={110} />
        </View>
        <Text style={styles.title} numberOfLines={1}>מערכת המראה / נחיתה</Text>
        <Text style={styles.subtitle}>הפעלת רחפן מבוקרת עם הזרמה חיה</Text>
        <PrimaryButton label="העלאת רחפן חדש" onPress={onStart} style={styles.button} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subtitle: {
    color: colors.muted,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  button: {
    marginTop: spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});

