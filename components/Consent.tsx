import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, PrimaryButton, Screen, styles } from '@/components/PlanimUI';
import { PRIVACY_SECTIONS } from '@/constants/privacy';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

function Check({ checked, onPress, children }: { checked: boolean; onPress: () => void; children: React.ReactNode }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
    <Feather name={checked ? 'check-square' : 'square'} size={22} color={checked ? colors.primary : colors.mutedForeground} style={{ marginTop: 1 }} />
    <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, lineHeight: 19 }}>{children}</Text>
  </Pressable>;
}

export function PrivacyText() {
  const colors = useColors();
  return <View style={{ gap: 12 }}>
    {PRIVACY_SECTIONS.map((section) => <Card key={section.title}>
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 16 }]}>{section.title}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 20 }}>{section.body}</Text>
    </Card>)}
  </View>;
}

/** Shown once, on the very first launch. */
export function Consent() {
  const colors = useColors();
  const { updateSettings } = usePlanim();
  const [read, setRead] = useState(false);
  const [usage, setUsage] = useState(false);
  const [lock, setLock] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const ready = read && usage && lock && guardian;

  return <Screen>
    <View style={{ gap: 14, paddingBottom: 12 }}>
      <View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>BAŞLAMADAN ÖNCE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Gizlilik ve izinler</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Bunu sadece bir kez onaylarsın. Metni okuyup aşağıdaki kutuları işaretle.</Text>
      </View>
      <PrivacyText />
      <Card tone="pink">
        <Check checked={read} onPress={() => setRead(!read)}>Aydınlatma metnini okudum, anladım.</Check>
        <Check checked={usage} onPress={() => setUsage(!usage)}>Ders sırasında hangi uygulamanın kaç dakika açıldığının bu cihazda kaydedilmesine izin veriyorum.</Check>
        <Check checked={lock} onPress={() => setLock(!lock)}>Ders sırasında seçtiğim uygulamaların kilitlenmesini kabul ediyorum.</Check>
        <Check checked={guardian} onPress={() => setGuardian(!guardian)}>18 yaşından küçüğüm; ebeveynim / yasal vasim bu onayı verdi ve bilgilendirildi.</Check>
        <PrimaryButton label="Onaylıyorum ve devam ediyorum" onPress={() => updateSettings({ consentAccepted: true, consentAt: new Date().toISOString() })} icon="check" disabled={!ready} />
      </Card>
    </View>
  </Screen>;
}
