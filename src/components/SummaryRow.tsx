import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from "../theme";

type SummaryRowProps = {
    label: string;
    value: string;
  };
  
 export const SummaryRow = ({ label, value }: SummaryRowProps) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
  
  
const styles = StyleSheet.create({
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
    }
  });
  