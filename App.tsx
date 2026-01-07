import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './src/theme';
import { NewFlightForm } from './src/components/NewFlightForm';
import { ApprovalStatus } from './src/components/ApprovalStatus';
import { StreamingScreen } from './src/components/StreamingScreen';
import { MissionSummaryCard } from './src/components/MissionSummary';
import { useOperationFlow } from './src/hooks/useOperationFlow';
import { STREAM_SERVER_URL, AUTO_APPROVE_MS } from './src/config';

export default function App() {
  const { phase, request, summary, approvalState, submitRequest, markStreamingStart, finishOperation, reset } =
    useOperationFlow(AUTO_APPROVE_MS);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {phase === 'form' && <NewFlightForm onSubmit={submitRequest} />}
        {phase === 'pending' && <ApprovalStatus status={approvalState} />}

        {(phase === 'approved' || phase === 'streaming') && request ? (
          <StreamingScreen
            request={request}
            streamUrl={STREAM_SERVER_URL}
            onStreamingStart={markStreamingStart}
            onFinish={finishOperation}
            autoStart
          />
        ) : null}

        {phase === 'summary' && summary ? <MissionSummaryCard summary={summary} onRestart={reset} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
});
