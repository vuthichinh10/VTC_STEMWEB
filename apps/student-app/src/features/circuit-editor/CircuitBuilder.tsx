import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/design-system/theme';
import { validateCircuit } from './compatibility';
import type { CircuitBuilderProps } from './CircuitBuilder.types';

export function CircuitBuilder({ board, moduleIds, specs, value, onChange }: CircuitBuilderProps) {
  const [selected, setSelected] = useState<string>();
  const lessonSpecs = moduleIds.flatMap((id) => specs.filter((spec) => spec.id === id));
  const issues = useMemo(() => validateCircuit(board, specs, value), [board, specs, value]);
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Chạm module, sau đó chạm GPIO</Text>
      <View style={styles.row}>
        {lessonSpecs.map((spec) => (
          <Pressable
            key={spec.id}
            onPress={() => setSelected(spec.id)}
            style={[styles.module, selected === spec.id && styles.selected]}
          >
            <Text>
              {spec.emoji} {spec.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.board}>
        <Text style={styles.boardTitle}>{board.displayName}</Text>
        {board.pins.map((pin) => (
          <Pressable
            key={pin.gpio}
            style={styles.pin}
            onPress={() => {
              if (!selected) return;
              onChange([
                ...value,
                { instanceId: `${selected}-${Date.now()}`, moduleId: selected, gpio: pin.gpio },
              ]);
              setSelected(undefined);
            }}
          >
            <Text style={styles.pinText}>
              {pin.label} · {pin.capabilities.join(' / ')}
            </Text>
          </Pressable>
        ))}
      </View>
      {issues.map((issue, index) => (
        <Text
          key={`${issue.code}-${index}`}
          style={issue.severity === 'ERROR' ? styles.error : styles.warning}
        >
          {issue.message}
        </Text>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 12 },
  title: { fontWeight: '900', color: colors.textPrimary },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  module: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  board: { backgroundColor: colors.navy, borderRadius: 16, padding: 16, gap: 8 },
  boardTitle: { color: '#fff', fontWeight: '900', fontSize: 17 },
  pin: { padding: 11, borderRadius: 9, borderWidth: 1, borderColor: '#5D947F' },
  pinText: { color: '#fff' },
  error: { color: colors.danger, fontWeight: '700' },
  warning: { color: colors.warning, fontWeight: '700' },
});
