// Bottom sheet for making a donation: shows the need, lets the donor pick a quantity, then confirms.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FoodBank, Need } from '../api/types';
import { CATEGORIES, colors, urgencyColor, urgencyLabel } from '../theme';

interface Props {
  target: { bank: FoodBank; need: Need } | null; // null = closed
  onClose: () => void;
  onConfirm: (bank: FoodBank, need: Need, qty: number) => Promise<void>;
}

const QUICK_PICKS = [1, 5, 10];

export function DonateSheet({ target, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<number | null>(null); // donated qty once confirmed

  // Reset whenever the sheet opens for a new need.
  useEffect(() => {
    if (target) {
      setText('1');
      setSubmitting(false);
      setDone(null);
    }
  }, [target]);

  if (!target) return null;
  const { bank, need } = target;
  const max = Math.max(1, need.needed_qty);
  const qty = Number.parseInt(text, 10);
  const valid = Number.isInteger(qty) && qty >= 1 && qty <= max;
  const category = CATEGORIES.find((c) => c.key === need.category);
  const color = urgencyColor(need.urgency);

  function setQty(n: number) {
    setText(String(Math.min(max, Math.max(1, n))));
  }

  function onChangeText(value: string) {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits === '') return setText('');
    setText(String(Math.min(max, Number.parseInt(digits, 10))));
  }

  async function confirm() {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(bank, need, qty);
      setDone(qty);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.handle} />

          {done != null ? (
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check" size={36} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Thank you!</Text>
              <Text style={styles.successText}>
                You're donating {done} {done === 1 ? 'unit' : 'units'} of {need.item.toLowerCase()} to {bank.name}.
              </Text>
              <Text style={styles.successHint}>Find the drop-off point on the Map tab.</Text>
              <Pressable style={styles.primaryBtn} onPress={onClose}>
                <Text style={styles.primaryText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={(category?.icon ?? 'food') as any} size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Donate {need.item}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {bank.name}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
                  <MaterialCommunityIcons name="close" size={24} color={colors.muted} />
                </Pressable>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Still needed</Text>
                  <Text style={styles.statValue}>{need.needed_qty} units</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Urgency</Text>
                  <View style={[styles.pill, { backgroundColor: color + '22' }]}>
                    <View style={[styles.pillDot, { backgroundColor: color }]} />
                    <Text style={[styles.pillText, { color }]}>{urgencyLabel(need.urgency)}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionLabel}>How many units?</Text>
              <View style={styles.stepper}>
                <StepButton icon="minus" disabled={!valid || qty <= 1} onPress={() => setQty((qty || 1) - 1)} />
                <TextInput
                  style={styles.qtyInput}
                  value={text}
                  onChangeText={onChangeText}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  selectTextOnFocus
                  maxLength={String(max).length}
                  accessibilityLabel="Quantity"
                />
                <StepButton icon="plus" disabled={valid && qty >= max} onPress={() => setQty((qty || 0) + 1)} />
              </View>
              <Text style={styles.hint}>Up to {max} units, the amount this food bank still needs.</Text>

              <View style={styles.quick}>
                {QUICK_PICKS.filter((n) => n < max).map((n) => (
                  <QuickPick key={n} label={String(n)} active={qty === n} onPress={() => setQty(n)} />
                ))}
                <QuickPick label={`All ${max}`} active={qty === max} onPress={() => setQty(max)} />
              </View>

              <Pressable
                style={[styles.primaryBtn, (!valid || submitting) && styles.primaryDisabled]}
                onPress={confirm}
                disabled={!valid || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>
                    {valid ? `Donate ${qty} ${qty === 1 ? 'unit' : 'units'}` : 'Enter a quantity'}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function StepButton(props: { icon: 'minus' | 'plus'; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.stepBtn, props.disabled && styles.stepBtnDisabled]}
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityLabel={props.icon === 'plus' ? 'Increase' : 'Decrease'}
    >
      <MaterialCommunityIcons name={props.icon} size={24} color={props.disabled ? colors.muted : colors.primary} />
    </Pressable>
  );
}

function QuickPick(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.quickBtn, props.active && styles.quickActive]} onPress={props.onPress}>
      <Text style={[styles.quickText, props.active && styles.quickTextActive]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 20 },
  stat: { flex: 1, backgroundColor: colors.bg, borderRadius: 12, padding: 12, gap: 6 },
  statLabel: { fontSize: 12, color: colors.muted },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 24, marginBottom: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { borderColor: colors.border },
  qtyInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, textAlign: 'center' },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  quickBtn: {
    flexGrow: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  quickText: { fontSize: 15, fontWeight: '600', color: colors.text },
  quickTextActive: { color: colors.primary },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'stretch',
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  success: { alignItems: 'center', paddingTop: 8 },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 14 },
  successText: { fontSize: 15, color: colors.text, textAlign: 'center', marginTop: 6, lineHeight: 21 },
  successHint: { fontSize: 13, color: colors.muted, marginTop: 6 },
});
