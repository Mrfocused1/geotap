import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { PLANS, formatPrice, limitLabel } from '@/constants/plans';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PlanId } from '@/constants/plans';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PLAN_ORDER: PlanId[] = ['free', 'pro', 'unlimited'];

export function UpgradeModal({ visible, onClose }: Props) {
  const currentPlanId = useAuthStore((s) => s.user?.planId ?? 'free');

  const handleUpgrade = (planId: PlanId) => {
    if (planId === currentPlanId) return;
    Alert.alert(
      'Coming soon',
      'In-app purchases will be available when the app launches on the App Store.'
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
            Choose a plan
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X stroke={Colors.text.muted} size={18} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}
        >
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = planId === currentPlanId;
            const isUpgrade =
              PLAN_ORDER.indexOf(planId) > PLAN_ORDER.indexOf(currentPlanId);

            return (
              <View
                key={planId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  borderWidth: isCurrent ? 2 : 1,
                  borderColor: isCurrent ? Colors.primary[600] : '#e2e8f0',
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isCurrent ? 0.1 : 0.04,
                  shadowRadius: 8,
                  elevation: isCurrent ? 4 : 1,
                }}
              >
                {/* Plan header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                    paddingBottom: 12,
                    backgroundColor: isCurrent
                      ? `${Colors.primary[600]}08`
                      : '#ffffff',
                  }}
                >
                  <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: '#0f172a',
                        }}
                      >
                        {plan.name}
                      </Text>
                      {isCurrent && (
                        <View
                          style={{
                            backgroundColor: `${Colors.primary[600]}18`,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: Colors.primary[700],
                            }}
                          >
                            Current plan
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '800',
                        color: Colors.primary[600],
                      }}
                    >
                      {formatPrice(plan.priceCents)}
                    </Text>
                  </View>

                  {isUpgrade && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Upgrade to ${plan.name}`}
                      onPress={() => handleUpgrade(planId)}
                      style={{
                        backgroundColor: Colors.primary[600],
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: 14,
                        }}
                      >
                        Upgrade
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Limits row */}
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    gap: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                  }}
                >
                  <LimitBadge
                    label="Geofences"
                    value={limitLabel(plan.limits.geofences)}
                  />
                  <LimitBadge
                    label="Checklists"
                    value={limitLabel(plan.limits.checklists)}
                  />
                  <LimitBadge
                    label="Items"
                    value={limitLabel(plan.limits.itemsPerChecklist)}
                  />
                </View>

                {/* Features */}
                <View style={{ padding: 20, paddingTop: 14, gap: 8 }}>
                  {plan.features.map((f) => (
                    <View
                      key={f}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: `${Colors.primary[600]}18`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check stroke={Colors.primary[600]} size={11} />
                      </View>
                      <Text style={{ fontSize: 13, color: '#475569' }}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#94a3b8',
              marginTop: 8,
            }}
          >
            Annual billing saves 2 months (17% off). Cancel anytime.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function LimitBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: '#94a3b8' }}>{label}</Text>
    </View>
  );
}
